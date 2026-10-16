import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Box,
  Layers,
  RotateCcw,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  Move,
  Type,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Eye,
  Check,
  Copy,
  Sparkles,
  Info,
} from 'lucide-react';

interface GeometryCanvasViewProps {
  onExportImageToExam?: (dataUrl: string, shapeTitle: string) => void;
}

export const GeometryCanvasView: React.FC<GeometryCanvasViewProps> = ({
  onExportImageToExam,
}) => {
  const [geometryMode, setGeometryMode] = useState<'2d' | '3d'>('3d');

  // ==========================================
  // STATE HÌNH PHẲNG 2D
  // ==========================================
  const [selected2DShape, setSelected2DShape] = useState<'triangle' | 'right_triangle' | 'rectangle' | 'circle' | 'polygon' | 'parabola'>('triangle');
  const [show2DGrid, setShow2DGrid] = useState(true);
  const [strokeColor, setStrokeColor] = useState('#2563eb');
  const [fillColor, setFillColor] = useState('rgba(37, 99, 235, 0.1)');
  const [pointCoordinates, setPointCoordinates] = useState<Record<string, { x: number; y: number }>>({
    A: { x: 250, y: 80 },
    B: { x: 120, y: 300 },
    C: { x: 380, y: 300 },
  });
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);

  // ==========================================
  // STATE HÌNH KHÔNG GIAN 3D
  // ==========================================
  const [selected3DShape, setSelected3DShape] = useState<
    'pyramid_quad' | 'pyramid_tri' | 'prism' | 'cube' | 'cone' | 'cylinder' | 'sphere'
  >('pyramid_quad');
  const [rotX, setRotX] = useState<number>(20);
  const [rotY, setRotY] = useState<number>(-35);
  const [zoomLevel, setZoomLevel] = useState<number>(1.1);
  const [show3DAxes, setShow3DAxes] = useState(true);
  const [showHiddenLines, setShowHiddenLines] = useState(true);
  const [showShading, setShowShading] = useState(true);
  const [heightParam, setHeightParam] = useState<number>(140);
  const [radiusParam, setRadiusParam] = useState<number>(90);
  const [isRotatingAuto, setIsRotatingAuto] = useState<boolean>(false);

  const [copiedDataUrl, setCopiedDataUrl] = useState(false);

  // Tự động xoay 3D nếu bật
  useEffect(() => {
    if (!isRotatingAuto) return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isRotatingAuto]);

  // Cập nhật tọa độ đỉnh khi đổi hình 2D
  const handleSelect2DShape = (shape: typeof selected2DShape) => {
    setSelected2DShape(shape);
    if (shape === 'triangle') {
      setPointCoordinates({
        A: { x: 250, y: 70 },
        B: { x: 120, y: 300 },
        C: { x: 380, y: 300 },
      });
    } else if (shape === 'right_triangle') {
      setPointCoordinates({
        A: { x: 120, y: 70 },
        B: { x: 120, y: 300 },
        C: { x: 380, y: 300 },
      });
    } else if (shape === 'rectangle') {
      setPointCoordinates({
        A: { x: 130, y: 100 },
        B: { x: 370, y: 100 },
        C: { x: 370, y: 280 },
        D: { x: 130, y: 280 },
      });
    } else if (shape === 'circle') {
      setPointCoordinates({
        O: { x: 250, y: 200 },
        R: { x: 350, y: 200 },
      });
    } else if (shape === 'polygon') {
      setPointCoordinates({
        A: { x: 250, y: 70 },
        B: { x: 360, y: 150 },
        C: { x: 320, y: 290 },
        D: { x: 180, y: 290 },
        E: { x: 140, y: 150 },
      });
    }
  };

  // Kéo thả đỉnh 2D trên SVG Canvas
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(20, Math.min(480, Math.round(e.clientX - rect.left)));
    const y = Math.max(20, Math.min(380, Math.round(e.clientY - rect.top)));

    setPointCoordinates((prev) => ({
      ...prev,
      [draggedPoint]: { x, y },
    }));
  };

  // Tính khoảng cách giữa 2 điểm
  const calcDist = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y));
  };

  // Hàm chiếu 3D sang 2D (Isometric / Perspective 3D Projection)
  const project3D = (x: number, y: number, z: number) => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // Xoay quanh trục Y
    const x1 = x * Math.cos(radY) + z * Math.sin(radY);
    const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

    // Xoay quanh trục X
    const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    // Điểm gốc màn hình ở trung tâm (cx=250, cy=210)
    const cx = 250;
    const cy = 200;
    const scale = zoomLevel;

    return {
      x: cx + x1 * scale,
      y: cy - y2 * scale, // SVG y hướng xuống dưới
      depth: z2,
    };
  };

  // Tạo ảnh Base64 từ canvas để chèn vào đề thi
  const handleExportCurrentShape = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nền trắng
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgElement = document.getElementById('geometry-svg-export');
    if (svgElement) {
      const xml = new XMLSerializer().serializeToString(svgElement);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const b64Start = 'data:image/svg+xml;base64,';
      const image64 = b64Start + svg64;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        if (onExportImageToExam) {
          const shapeTitle =
            geometryMode === '3d'
              ? `Hình không gian 3D (${selected3DShape})`
              : `Hình học phẳng 2D (${selected2DShape})`;
          onExportImageToExam(pngUrl, shapeTitle);
        }
        setCopiedDataUrl(true);
        setTimeout(() => setCopiedDataUrl(false), 2500);
      };
      img.src = image64;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={14} className="text-blue-600" />
              <span>Phòng Thí Nghiệm Hình Học Toán Học</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              Công Cụ Vẽ Trực Quan Cho GV & HS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Vẽ Hình 2D & Hình Không Gian 3D
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Tương tác xoay 360° khối đa diện Oxyz, nét khuất đứt đoạn chuẩn Bộ GD&ĐT, vẽ hình phẳng và xuất ảnh trực tiếp vào đề thi.
          </p>
        </div>

        {/* Chuyển chế độ 2D / 3D */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setGeometryMode('3d')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              geometryMode === '3d' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box size={16} />
            <span>Hình Không Gian 3D (Oxyz)</span>
          </button>
          <button
            onClick={() => setGeometryMode('2d')}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              geometryMode === '2d' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={16} />
            <span>Hình Học Phẳng 2D</span>
          </button>
        </div>
      </div>

      {/* Main Studio Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái: Bảng điều khiển công cụ hình học (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {geometryMode === '3d' ? (
            /* ================= BẢNG ĐIỀU KHIỂN 3D ================= */
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs text-xs">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Box size={16} className="text-blue-600" />
                <span>Chọn Mô Hình Không Gian 3D:</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelected3DShape('pyramid_quad')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected3DShape === 'pyramid_quad'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-extrabold text-xs">Chóp S.ABCD</span>
                  <span className="text-[10px] text-slate-500 font-normal">Đáy hình bình hành</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelected3DShape('pyramid_tri')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected3DShape === 'pyramid_tri'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-extrabold text-xs">Chóp S.ABC</span>
                  <span className="text-[10px] text-slate-500 font-normal">Tứ diện đều/vuông</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelected3DShape('prism')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected3DShape === 'prism'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-extrabold text-xs">Lăng Trụ Tam Giác</span>
                  <span className="text-[10px] text-slate-500 font-normal">ABC.A'B'C'</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelected3DShape('cube')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected3DShape === 'cube'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-extrabold text-xs">Khối Lập Phương</span>
                  <span className="text-[10px] text-slate-500 font-normal">Hộp chữ nhật ABCD.A'B'C'D'</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelected3DShape('cone')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected3DShape === 'cone'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-extrabold text-xs">Khối Nón Tròn Xoay</span>
                  <span className="text-[10px] text-slate-500 font-normal">Đỉnh S, bán kính R</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelected3DShape('cylinder')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected3DShape === 'cylinder'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-extrabold text-xs">Khối Trụ Tròn Xoay</span>
                  <span className="text-[10px] text-slate-500 font-normal">2 đáy song song</span>
                </button>
              </div>

              {/* Tùy chỉnh góc xoay & kích thước */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Góc xoay ngang Y ({rotY}°):</span>
                  <button
                    onClick={() => {
                      setRotX(20);
                      setRotY(-35);
                      setZoomLevel(1.1);
                    }}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>Mặc định</span>
                  </button>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={rotY}
                  onChange={(e) => setRotY(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Góc nghiêng dọc X ({rotX}°):</span>
                </div>
                <input
                  type="range"
                  min={-45}
                  max={60}
                  value={rotX}
                  onChange={(e) => setRotX(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Chiều cao $h$ ({heightParam}):</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={200}
                  value={heightParam}
                  onChange={(e) => setHeightParam(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Tùy chọn hiển thị nét đứt và hệ trục */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showHiddenLines}
                    onChange={(e) => setShowHiddenLines(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Hiện nét đứt đoạn khuất (Chuẩn SGK)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={show3DAxes}
                    onChange={(e) => setShow3DAxes(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Hiện hệ trục tọa độ không gian Oxyz</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showShading}
                    onChange={(e) => setShowShading(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Tô bóng mặt phẳng trong suốt</span>
                </label>
              </div>

              {/* Tự động xoay 360 */}
              <button
                type="button"
                onClick={() => setIsRotatingAuto(!isRotatingAuto)}
                className={`w-full py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                  isRotatingAuto
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <RotateCcw size={14} className={isRotatingAuto ? 'animate-spin' : ''} />
                <span>{isRotatingAuto ? 'Dừng Tự Động Xoay' : 'Bật Tự Động Xoay 360°'}</span>
              </button>
            </div>
          ) : (
            /* ================= BẢNG ĐIỀU KHIỂN 2D ================= */
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs text-xs">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layers size={16} className="text-blue-600" />
                <span>Chọn Dạng Hình Phẳng 2D:</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelect2DShape('triangle')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected2DShape === 'triangle'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Tam Giác ABC</span>
                  <span className="text-[10px] text-slate-500 font-normal">Kéo đỉnh tự do</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect2DShape('right_triangle')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected2DShape === 'right_triangle'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Tam Giác Vuông</span>
                  <span className="text-[10px] text-slate-500 font-normal">Góc vuông tại A</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect2DShape('rectangle')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected2DShape === 'rectangle'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Tứ Giác ABCD</span>
                  <span className="text-[10px] text-slate-500 font-normal">Hình chữ nhật / Vuông</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect2DShape('circle')}
                  className={`p-2.5 rounded-xl border font-bold text-left transition-all ${
                    selected2DShape === 'circle'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">Đường Tròn (O, R)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Tâm O và bán kính</span>
                </button>
              </div>

              {/* Tùy chỉnh màu sắc & lưới */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Màu nét vẽ:</span>
                  <div className="flex items-center gap-1.5">
                    {['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => {
                          setStrokeColor(col);
                          setFillColor(`${col}20`);
                        }}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full border-2 ${
                          strokeColor === col ? 'border-slate-800 scale-110' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={show2DGrid}
                    onChange={(e) => setShow2DGrid(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Bật lưới ô vuông tọa độ Oxy</span>
                </label>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <span className="font-extrabold block">💡 Mẹo thao tác 2D:</span>
                <p>
                  Nhấp giữ chuột vào các điểm tròn đỏ ($A, B, C...$) trên bảng vẽ để kéo giãn thay đổi hình dạng tức thì!
                </p>
              </div>
            </div>
          )}

          {/* Nút Xuất Ảnh & Chèn vào đề thi */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-xs text-slate-800">Tác Vụ Xuất Bản Hình Vẽ:</h4>

            <button
              type="button"
              onClick={handleExportCurrentShape}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              {copiedDataUrl ? (
                <>
                  <Check size={16} />
                  <span>Đã Xuất & Lưu Hình Ảnh!</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Chụp Ảnh Đính Kèm Câu Hỏi Đề Thi</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Hình ảnh sẽ được chuyển đổi sang chuẩn PNG độ phân giải cao để đính kèm vào đề thi hoặc bài giảng.
            </p>
          </div>
        </div>

        {/* Cột phải: Khung Canvas Vẽ Tương Tác (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center relative min-h-[520px]">
          {/* Quick Floating Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-100/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 z-20 text-xs">
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 2.0))}
              title="Phóng to"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.6))}
              title="Thu nhỏ"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={() => {
                setRotX(20);
                setRotY(-35);
                setZoomLevel(1.1);
              }}
              title="Đặt lại góc nhìn"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Canvas SVG Export Wrapper */}
          <div className="w-full max-w-[500px] aspect-5/4 relative flex items-center justify-center select-none overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
            {geometryMode === '3d' ? (
              /* ================= CANVAS RENDER 3D ================= */
              <svg
                id="geometry-svg-export"
                viewBox="0 0 500 400"
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const initialRotY = rotY;
                  const initialRotX = rotX;

                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const dx = moveEvent.clientX - startX;
                    const dy = moveEvent.clientY - startY;
                    setRotY(initialRotY + dx * 0.7);
                    setRotX(Math.max(-45, Math.min(60, initialRotX - dy * 0.5)));
                  };

                  const onMouseUp = () => {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                  };

                  window.addEventListener('mousemove', onMouseMove);
                  window.addEventListener('mouseup', onMouseUp);
                }}
              >
                {/* Lưới nền tinh tế */}
                <defs>
                  <pattern id="grid3d" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="500" height="400" fill="url(#grid3d)" opacity="0.6" />

                {/* Hệ trục tọa độ 3D Oxyz */}
                {show3DAxes && (() => {
                  const O = project3D(0, 0, 0);
                  const X = project3D(120, 0, 0);
                  const Y = project3D(0, 120, 0);
                  const Z = project3D(0, 0, 120);

                  return (
                    <g className="text-[11px] font-mono font-bold">
                      {/* Trục Ox (Đỏ) */}
                      <line x1={O.x} y1={O.y} x2={X.x} y2={X.y} stroke="#ef4444" strokeWidth="1.5" />
                      <text x={X.x + 5} y={X.y + 4} fill="#ef4444">x</text>

                      {/* Trục Oy (Xanh lá) */}
                      <line x1={O.x} y1={O.y} x2={Y.x} y2={Y.y} stroke="#10b981" strokeWidth="1.5" />
                      <text x={Y.x} y={Y.y - 6} fill="#10b981">y</text>

                      {/* Trục Oz (Xanh dương) */}
                      <line x1={O.x} y1={O.y} x2={Z.x} y2={Z.y} stroke="#3b82f6" strokeWidth="1.5" />
                      <text x={Z.x - 12} y={Z.y + 12} fill="#3b82f6">z</text>

                      {/* Gốc O */}
                      <circle cx={O.x} cy={O.y} r="2.5" fill="#64748b" />
                      <text x={O.x - 12} y={O.y + 12} fill="#64748b">O</text>
                    </g>
                  );
                })()}

                {/* HÌNH 1: CHÓP TỨ GIÁC S.ABCD */}
                {selected3DShape === 'pyramid_quad' && (() => {
                  const h = heightParam;
                  const a = 90;
                  const b = 70;

                  // Đáy hình bình hành ABCD (mặt phẳng x-z)
                  const S = project3D(0, h, 0);
                  const A = project3D(-a, 0, b);
                  const B = project3D(a, 0, b);
                  const C = project3D(a + 20, 0, -b);
                  const D = project3D(-a + 20, 0, -b);

                  return (
                    <g className="font-bold text-xs">
                      {/* Mặt đáy tô bóng */}
                      {showShading && (
                        <polygon
                          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`}
                          fill="rgba(59, 130, 246, 0.08)"
                        />
                      )}

                      {/* Cạnh đáy thấy được */}
                      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {/* Cạnh đáy khuất (nét đứt) */}
                      {showHiddenLines && (
                        <>
                          <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                          <line x1={D.x} y1={D.y} x2={C.x} y2={C.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                          <line x1={S.x} y1={S.y} x2={D.x} y2={D.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                          {/* Đường cao SO */}
                          <line x1={S.x} y1={S.y} x2={(A.x + C.x) / 2} y2={(A.y + C.y) / 2} stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" />
                        </>
                      )}

                      {/* Các cạnh bên thấy được */}
                      <line x1={S.x} y1={S.y} x2={A.x} y2={A.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {/* Điểm đỉnh và Nhãn */}
                      {[
                        { pt: S, label: 'S', dx: 0, dy: -8 },
                        { pt: A, label: 'A', dx: -12, dy: 14 },
                        { pt: B, label: 'B', dx: 10, dy: 14 },
                        { pt: C, label: 'C', dx: 12, dy: -2 },
                        { pt: D, label: 'D', dx: -14, dy: -4 },
                      ].map((item, idx) => (
                        <g key={idx}>
                          <circle cx={item.pt.x} cy={item.pt.y} r="3" fill="#2563eb" />
                          <text x={item.pt.x + item.dx} y={item.pt.y + item.dy} fill="#0f172a">
                            {item.label}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}

                {/* HÌNH 2: CHÓP TAM GIÁC S.ABC (TỨ DIỆN) */}
                {selected3DShape === 'pyramid_tri' && (() => {
                  const h = heightParam;
                  const S = project3D(0, h, 0);
                  const A = project3D(-90, 0, 70);
                  const B = project3D(90, 0, 70);
                  const C = project3D(20, 0, -80);

                  return (
                    <g className="font-bold text-xs">
                      {showShading && (
                        <polygon
                          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                          fill="rgba(99, 102, 241, 0.08)"
                        />
                      )}
                      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {showHiddenLines && (
                        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                      )}

                      <line x1={S.x} y1={S.y} x2={A.x} y2={A.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {[
                        { pt: S, label: 'S', dx: 0, dy: -8 },
                        { pt: A, label: 'A', dx: -12, dy: 12 },
                        { pt: B, label: 'B', dx: 10, dy: 12 },
                        { pt: C, label: 'C', dx: 10, dy: -6 },
                      ].map((item, idx) => (
                        <g key={idx}>
                          <circle cx={item.pt.x} cy={item.pt.y} r="3" fill="#6366f1" />
                          <text x={item.pt.x + item.dx} y={item.pt.y + item.dy} fill="#0f172a">
                            {item.label}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}

                {/* HÌNH 3: KHỐI HỘP CHỮ NHẬT / LẬP PHƯƠNG */}
                {selected3DShape === 'cube' && (() => {
                  const s = 65;
                  const h = heightParam * 0.7;

                  const A = project3D(-s, 0, s);
                  const B = project3D(s, 0, s);
                  const C = project3D(s, 0, -s);
                  const D = project3D(-s, 0, -s);

                  const A1 = project3D(-s, h, s);
                  const B1 = project3D(s, h, s);
                  const C1 = project3D(s, h, -s);
                  const D1 = project3D(-s, h, -s);

                  return (
                    <g className="font-bold text-xs">
                      {/* Đáy trên thấy toàn bộ */}
                      <polygon
                        points={`${A1.x},${A1.y} ${B1.x},${B1.y} ${C1.x},${C1.y} ${D1.x},${D1.y}`}
                        fill="rgba(59, 130, 246, 0.12)"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                      />

                      {/* Các cạnh đứng thấy được */}
                      <line x1={A1.x} y1={A1.y} x2={A.x} y2={A.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={B1.x} y1={B1.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={C1.x} y1={C1.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {/* Cạnh đáy thấy được */}
                      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {/* Các cạnh khuất */}
                      {showHiddenLines && (
                        <>
                          <line x1={D1.x} y1={D1.y} x2={D.x} y2={D.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                          <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                          <line x1={D.x} y1={D.y} x2={C.x} y2={C.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                        </>
                      )}

                      {[
                        { pt: A, label: 'A', dx: -12, dy: 12 },
                        { pt: B, label: 'B', dx: 8, dy: 12 },
                        { pt: C, label: 'C', dx: 10, dy: 0 },
                        { pt: A1, label: "A'", dx: -14, dy: -6 },
                        { pt: B1, label: "B'", dx: 6, dy: -6 },
                        { pt: C1, label: "C'", dx: 8, dy: -8 },
                        { pt: D1, label: "D'", dx: -14, dy: -8 },
                      ].map((item, idx) => (
                        <g key={idx}>
                          <circle cx={item.pt.x} cy={item.pt.y} r="2.5" fill="#2563eb" />
                          <text x={item.pt.x + item.dx} y={item.pt.y + item.dy} fill="#0f172a">
                            {item.label}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}

                {/* HÌNH 4: KHỐI NÓN TRÒN XOAY */}
                {selected3DShape === 'cone' && (() => {
                  const h = heightParam;
                  const r = radiusParam;
                  const S = project3D(0, h, 0);
                  const O = project3D(0, 0, 0);
                  const A = project3D(-r, 0, 0);
                  const B = project3D(r, 0, 0);

                  return (
                    <g className="font-bold text-xs">
                      {/* Đáy elip */}
                      <ellipse
                        cx={O.x}
                        cy={O.y}
                        rx={r * zoomLevel}
                        ry={r * 0.35 * zoomLevel}
                        fill="rgba(59, 130, 246, 0.08)"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                      />

                      {/* Đường sinh 2 bên */}
                      <line x1={S.x} y1={S.y} x2={A.x} y2={A.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />

                      {/* Trục đường cao SO và bán kính OA */}
                      {showHiddenLines && (
                        <>
                          <line x1={S.x} y1={S.y} x2={O.x} y2={O.y} stroke="#ef4444" strokeWidth="1.4" strokeDasharray="4 3" />
                          <line x1={O.x} y1={O.y} x2={A.x} y2={A.y} stroke="#2563eb" strokeWidth="1.4" strokeDasharray="4 3" />
                        </>
                      )}

                      <circle cx={S.x} cy={S.y} r="3" fill="#2563eb" />
                      <text x={S.x} y={S.y - 8} fill="#0f172a">S</text>
                      <circle cx={O.x} cy={O.y} r="2.5" fill="#ef4444" />
                      <text x={O.x + 6} y={O.y + 4} fill="#ef4444">O</text>
                      <text x={(O.x + A.x) / 2} y={O.y - 6} fill="#2563eb" className="text-[10px]">R</text>
                      <text x={S.x + 6} y={(S.y + O.y) / 2} fill="#ef4444" className="text-[10px]">h</text>
                    </g>
                  );
                })()}

                {/* HÌNH 5: KHỐI TRỤ & LĂNG TRỤ */}
                {selected3DShape === 'cylinder' && (() => {
                  const h = heightParam * 0.8;
                  const r = radiusParam;
                  const O1 = project3D(0, h, 0);
                  const O2 = project3D(0, 0, 0);
                  const A1 = project3D(-r, h, 0);
                  const B1 = project3D(r, h, 0);
                  const A2 = project3D(-r, 0, 0);
                  const B2 = project3D(r, 0, 0);

                  return (
                    <g className="font-bold text-xs">
                      {/* Đáy trên */}
                      <ellipse
                        cx={O1.x}
                        cy={O1.y}
                        rx={r * zoomLevel}
                        ry={r * 0.35 * zoomLevel}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                      />

                      {/* Đáy dưới */}
                      <ellipse
                        cx={O2.x}
                        cy={O2.y}
                        rx={r * zoomLevel}
                        ry={r * 0.35 * zoomLevel}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                      />

                      {/* Hai đường sinh */}
                      <line x1={A1.x} y1={A1.y} x2={A2.x} y2={A2.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={B1.x} y1={B1.y} x2={B2.x} y2={B2.y} stroke="#1e293b" strokeWidth="1.8" />

                      {/* Trục nối 2 tâm */}
                      {showHiddenLines && (
                        <line x1={O1.x} y1={O1.y} x2={O2.x} y2={O2.y} stroke="#ef4444" strokeWidth="1.4" strokeDasharray="4 3" />
                      )}

                      <circle cx={O1.x} cy={O1.y} r="2.5" fill="#ef4444" />
                      <text x={O1.x + 5} y={O1.y - 4} fill="#ef4444">O'</text>
                      <circle cx={O2.x} cy={O2.y} r="2.5" fill="#ef4444" />
                      <text x={O2.x + 5} y={O2.y + 12} fill="#ef4444">O</text>
                    </g>
                  );
                })()}

                {/* HÌNH 6: LĂNG TRỤ TAM GIÁC */}
                {selected3DShape === 'prism' && (() => {
                  const h = heightParam * 0.8;
                  const A = project3D(-80, 0, 50);
                  const B = project3D(80, 0, 50);
                  const C = project3D(10, 0, -60);

                  const A1 = project3D(-80, h, 50);
                  const B1 = project3D(80, h, 50);
                  const C1 = project3D(10, h, -60);

                  return (
                    <g className="font-bold text-xs">
                      <polygon
                        points={`${A1.x},${A1.y} ${B1.x},${B1.y} ${C1.x},${C1.y}`}
                        fill="rgba(59, 130, 246, 0.12)"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                      />

                      <line x1={A1.x} y1={A1.y} x2={A.x} y2={A.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={B1.x} y1={B1.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={C1.x} y1={C1.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {showHiddenLines && (
                        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                      )}

                      {[
                        { pt: A, label: 'A', dx: -12, dy: 12 },
                        { pt: B, label: 'B', dx: 8, dy: 12 },
                        { pt: C, label: 'C', dx: 10, dy: -4 },
                        { pt: A1, label: "A'", dx: -14, dy: -6 },
                        { pt: B1, label: "B'", dx: 6, dy: -6 },
                        { pt: C1, label: "C'", dx: 8, dy: -8 },
                      ].map((item, idx) => (
                        <g key={idx}>
                          <circle cx={item.pt.x} cy={item.pt.y} r="2.5" fill="#2563eb" />
                          <text x={item.pt.x + item.dx} y={item.pt.y + item.dy} fill="#0f172a">
                            {item.label}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>
            ) : (
              /* ================= CANVAS RENDER 2D ================= */
              <svg
                id="geometry-svg-export"
                viewBox="0 0 500 400"
                className="w-full h-full"
                onMouseMove={handleSvgMouseMove}
                onMouseUp={() => setDraggedPoint(null)}
              >
                {/* Lưới tọa độ Oxy */}
                {show2DGrid && (
                  <>
                    <defs>
                      <pattern id="grid2d" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                      </pattern>
                    </defs>
                    <rect width="500" height="400" fill="url(#grid2d)" />

                    {/* Trục Oxy chính */}
                    <line x1="0" y1="200" x2="500" y2="200" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="250" y1="0" x2="250" y2="400" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x="485" y="195" fill="#64748b" className="text-xs font-mono font-bold">x</text>
                    <text x="255" y="15" fill="#64748b" className="text-xs font-mono font-bold">y</text>
                    <text x="240" y="215" fill="#64748b" className="text-[11px] font-mono font-bold">O</text>
                  </>
                )}

                {/* VẼ HÌNH TAM GIÁC (HOẶC TAM GIÁC VUÔNG) */}
                {(selected2DShape === 'triangle' || selected2DShape === 'right_triangle') && (() => {
                  const A = pointCoordinates.A || { x: 250, y: 70 };
                  const B = pointCoordinates.B || { x: 120, y: 300 };
                  const C = pointCoordinates.C || { x: 380, y: 300 };

                  const dAB = calcDist(A, B);
                  const dBC = calcDist(B, C);
                  const dCA = calcDist(C, A);

                  return (
                    <g>
                      <polygon
                        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="2.2"
                      />

                      {/* Ký hiệu góc vuông nếu là right_triangle */}
                      {selected2DShape === 'right_triangle' && (
                        <rect x={A.x} y={A.y} width="16" height="16" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                      )}

                      {/* Nhãn độ dài cạnh */}
                      <text x={(B.x + C.x) / 2} y={B.y + 16} fill="#64748b" textAnchor="middle" className="text-[11px] font-mono">
                        a = {dBC} px
                      </text>
                      <text x={(A.x + B.x) / 2 - 14} y={(A.y + B.y) / 2} fill="#64748b" textAnchor="middle" className="text-[11px] font-mono">
                        c = {dAB}
                      </text>
                      <text x={(A.x + C.x) / 2 + 14} y={(A.y + C.y) / 2} fill="#64748b" textAnchor="middle" className="text-[11px] font-mono">
                        b = {dCA}
                      </text>
                    </g>
                  );
                })()}

                {/* VẼ TỨ GIÁC ABCD */}
                {selected2DShape === 'rectangle' && (() => {
                  const A = pointCoordinates.A || { x: 130, y: 100 };
                  const B = pointCoordinates.B || { x: 370, y: 100 };
                  const C = pointCoordinates.C || { x: 370, y: 280 };
                  const D = pointCoordinates.D || { x: 130, y: 280 };

                  return (
                    <polygon
                      points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="2.2"
                    />
                  );
                })()}

                {/* VẼ ĐƯỜNG TRÒN (O, R) */}
                {selected2DShape === 'circle' && (() => {
                  const O = pointCoordinates.O || { x: 250, y: 200 };
                  const R_pt = pointCoordinates.R || { x: 350, y: 200 };
                  const r = calcDist(O, R_pt);

                  return (
                    <g>
                      <circle cx={O.x} cy={O.y} r={r} fill={fillColor} stroke={strokeColor} strokeWidth="2.2" />
                      <line x1={O.x} y1={O.y} x2={R_pt.x} y2={R_pt.y} stroke="#ef4444" strokeWidth="1.8" strokeDasharray="3 3" />
                      <text x={(O.x + R_pt.x) / 2} y={O.y - 6} fill="#ef4444" className="text-xs font-bold font-mono">
                        R = {r}
                      </text>
                    </g>
                  );
                })()}

                {/* VẼ ĐA GIÁC ĐỀU */}
                {selected2DShape === 'polygon' && (() => {
                  const pts = Object.values(pointCoordinates);
                  const ptsStr = pts.map((p) => `${p.x},${p.y}`).join(' ');
                  return (
                    <polygon points={ptsStr} fill={fillColor} stroke={strokeColor} strokeWidth="2.2" />
                  );
                })()}

                {/* Các điểm điều khiển kéo thả (Control Points) */}
                {Object.entries(pointCoordinates).map(([name, pt]) => (
                  <g
                    key={name}
                    className="cursor-move"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggedPoint(name);
                    }}
                  >
                    <circle cx={pt.x} cy={pt.y} r="8" fill="rgba(239, 68, 68, 0.2)" />
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={pt.x + 8} y={pt.y - 8} fill="#0f172a" className="font-extrabold text-xs">
                      {name}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>

          {/* Hướng dẫn tương tác */}
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
            <Info size={15} className="text-blue-600" />
            <span>
              {geometryMode === '3d'
                ? 'Nhấp chuột và kéo trên khung hình để xoay mô hình 3D tự do quanh các trục.'
                : 'Nhấp giữ và kéo các chấm tròn đỏ để thay đổi độ dài cạnh và góc của hình phẳng.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
