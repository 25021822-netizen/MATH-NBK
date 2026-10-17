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
  MousePointer,
  PenTool,
  Ruler,
  Trash2,
  Plus,
  CheckCircle2,
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
  // CÔNG CỤ TỰ VẼ TƯƠNG TÁC 2D (ĐOẠN THẲNG, TRUNG ĐIỂM, ĐƯỜNG CAO)
  // ==========================================
  const [tool2D, setTool2D] = useState<'pointer' | 'segment' | 'midpoint' | 'altitude' | 'add_point'>('pointer');
  const [selectedPointsForTool, setSelectedPointsForTool] = useState<string[]>([]);
  const [customSegments2D, setCustomSegments2D] = useState<{ id: string; p1: string; p2: string; style?: 'solid' | 'dashed'; color?: string }[]>([]);
  const [customMidpoints2D, setCustomMidpoints2D] = useState<{ id: string; label: string; p1: string; p2: string }[]>([]);
  const [toolStatusMessage, setToolStatusMessage] = useState<string | null>(null);

  // Bảo vệ an toàn kiểu mảng: chống crash khi React Fast Refresh / state deserialization
  const safeCustomSegments2D = Array.isArray(customSegments2D) ? customSegments2D : [];
  const safeCustomMidpoints2D = Array.isArray(customMidpoints2D) ? customMidpoints2D : [];
  const safeSelectedPointsForTool = Array.isArray(selectedPointsForTool) ? selectedPointsForTool : [];

  // Tự động chuẩn hóa state về mảng nếu bị lưu sai kiểu
  useEffect(() => {
    if (!Array.isArray(customSegments2D)) {
      setCustomSegments2D([]);
    }
    if (!Array.isArray(customMidpoints2D)) {
      setCustomMidpoints2D([]);
    }
    if (!Array.isArray(selectedPointsForTool)) {
      setSelectedPointsForTool([]);
    }
  }, [customSegments2D, customMidpoints2D, selectedPointsForTool]);

  // ==========================================
  // STATE HÌNH KHÔNG GIAN 3D & THIẾT DIỆN TỰ THAO TÁC
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

  // TÍNH NĂNG 3D: TRUNG ĐIỂM, ĐOẠN THẲNG, MẶT PHẲNG THIẾT DIỆN
  const [show3DMidpoints, setShow3DMidpoints] = useState<boolean>(true);
  const [show3DBaseDiagonals, setShow3DBaseDiagonals] = useState<boolean>(true);
  const [show3DMidpointSegments, setShow3DMidpointSegments] = useState<boolean>(true);
  const [show3DAltitudeSO, setShow3DAltitudeSO] = useState<boolean>(true);
  const [selectedCuttingPlane, setSelectedCuttingPlane] = useState<
    'none' | 'plane_mnp' | 'plane_sac' | 'plane_sbd' | 'plane_parallel'
  >('plane_mnp');
  const [planeColorTheme, setPlaneColorTheme] = useState<'amber' | 'violet' | 'emerald' | 'cyan'>('amber');
  const [planeOpacity, setPlaneOpacity] = useState<number>(0.35);

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
    setCustomSegments2D([]);
    setCustomMidpoints2D([]);
    setSelectedPointsForTool([]);
    setToolStatusMessage(null);

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

  // Xử lý nhấp chọn điểm trên bảng vẽ 2D (Vẽ đoạn thẳng, trung điểm, đường cao)
  const handlePointClick2D = (pointName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. Vẽ đoạn thẳng nối 2 điểm
    if (tool2D === 'segment') {
      if (safeSelectedPointsForTool.length === 0) {
        setSelectedPointsForTool([pointName]);
        setToolStatusMessage(`Đã chọn điểm [${pointName}]. Hãy nhấp chọn điểm thứ hai để nối đoạn thẳng.`);
      } else if (safeSelectedPointsForTool.length === 1) {
        if (safeSelectedPointsForTool[0] !== pointName) {
          const p1 = safeSelectedPointsForTool[0];
          const p2 = pointName;
          setCustomSegments2D((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            { id: `seg_${Date.now()}`, p1, p2, style: 'solid', color: strokeColor },
          ]);
          setSelectedPointsForTool([]);
          setToolStatusMessage(`Đã vẽ đoạn thẳng nối [${p1}${p2}]!`);
          setTimeout(() => setToolStatusMessage(null), 3000);
        }
      }
      return;
    }

    // 2. Tạo trung điểm của đoạn nối 2 điểm
    if (tool2D === 'midpoint') {
      if (safeSelectedPointsForTool.length === 0) {
        setSelectedPointsForTool([pointName]);
        setToolStatusMessage(`Đã chọn điểm [${pointName}]. Hãy nhấp chọn điểm thứ hai để tính trung điểm.`);
      } else if (safeSelectedPointsForTool.length === 1) {
        if (safeSelectedPointsForTool[0] !== pointName) {
          const p1 = safeSelectedPointsForTool[0];
          const p2 = pointName;
          const pt1 = pointCoordinates[p1];
          const pt2 = pointCoordinates[p2];
          if (pt1 && pt2) {
            const availableLabels = ['M', 'N', 'P', 'Q', 'K', 'I', 'E', 'F', 'J'];
            const existingKeys = Object.keys(pointCoordinates);
            const nextLabel = availableLabels.find((l) => !existingKeys.includes(l)) || `M${existingKeys.length}`;
            const midX = Math.round((pt1.x + pt2.x) / 2);
            const midY = Math.round((pt1.y + pt2.y) / 2);

            setPointCoordinates((prev) => ({ ...prev, [nextLabel]: { x: midX, y: midY } }));
            setCustomMidpoints2D((prev) => [
              ...(Array.isArray(prev) ? prev : []),
              { id: `mid_${Date.now()}`, label: nextLabel, p1, p2 },
            ]);
            setSelectedPointsForTool([]);
            setToolStatusMessage(`Đã tạo trung điểm [${nextLabel}] của đoạn [${p1}${p2}]!`);
            setTimeout(() => setToolStatusMessage(null), 3500);
          }
        }
      }
      return;
    }

    // 3. Vẽ đường cao / vuông góc
    if (tool2D === 'altitude') {
      if (safeSelectedPointsForTool.length === 0) {
        setSelectedPointsForTool([pointName]);
        setToolStatusMessage(`Đỉnh [${pointName}]. Hãy nhấp chọn điểm thứ nhất của cạnh đáy.`);
      } else if (safeSelectedPointsForTool.length === 1) {
        setSelectedPointsForTool((prev) => [...(Array.isArray(prev) ? prev : []), pointName]);
        setToolStatusMessage(`Đã chọn đỉnh [${safeSelectedPointsForTool[0]}] và điểm đáy 1 [${pointName}]. Chọn tiếp điểm đáy 2.`);
      } else if (safeSelectedPointsForTool.length === 2) {
        const V = pointCoordinates[safeSelectedPointsForTool[0]];
        const B1 = pointCoordinates[safeSelectedPointsForTool[1]];
        const B2 = pointCoordinates[pointName];
        if (V && B1 && B2) {
          const dx = B2.x - B1.x;
          const dy = B2.y - B1.y;
          const lenSq = dx * dx + dy * dy;
          const t = lenSq !== 0 ? Math.max(0.05, Math.min(0.95, ((V.x - B1.x) * dx + (V.y - B1.y) * dy) / lenSq)) : 0.5;
          const footX = Math.round(B1.x + t * dx);
          const footY = Math.round(B1.y + t * dy);
          const footLabel = 'H';

          setPointCoordinates((prev) => ({ ...prev, [footLabel]: { x: footX, y: footY } }));
          setCustomSegments2D((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            { id: `alt_${Date.now()}`, p1: safeSelectedPointsForTool[0], p2: footLabel, style: 'dashed', color: '#dc2626' },
          ]);
          setSelectedPointsForTool([]);
          setToolStatusMessage(`Đã vẽ đường cao ${safeSelectedPointsForTool[0]}H vuông góc với [${safeSelectedPointsForTool[1]}${pointName}]!`);
          setTimeout(() => setToolStatusMessage(null), 3500);
        }
      }
      return;
    }
  };

  // Thêm điểm tự do khi click lên canvas
  const handleSvgCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (tool2D !== 'add_point') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(20, Math.min(480, Math.round(e.clientX - rect.left)));
    const y = Math.max(20, Math.min(380, Math.round(e.clientY - rect.top)));

    const availableLabels = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    const existingKeys = Object.keys(pointCoordinates);
    const nextLabel = availableLabels.find((l) => !existingKeys.includes(l)) || `P${existingKeys.length}`;

    setPointCoordinates((prev) => ({ ...prev, [nextLabel]: { x, y } }));
    setToolStatusMessage(`Đã tạo điểm mới [${nextLabel}] tại (${x}, ${y})!`);
    setTimeout(() => setToolStatusMessage(null), 3000);
  };

  // Khôi phục hình vẽ ban đầu
  const handleReset2DCustom = () => {
    setCustomSegments2D([]);
    setCustomMidpoints2D([]);
    setSelectedPointsForTool([]);
    handleSelect2DShape(selected2DShape);
    setToolStatusMessage('Đã khôi phục các nét vẽ 2D ban đầu.');
    setTimeout(() => setToolStatusMessage(null), 2500);
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

              {/* ========================================================= */}
              {/* NÂNG CẤP TÍNH NĂNG 3D: TRUNG ĐIỂM, ĐOẠN THẲNG, MẶT PHẲNG */}
              {/* ========================================================= */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Tự Thao Tác Vẽ Hình Không Gian 3D:</span>
                  </span>
                </div>

                {/* 1. Thao tác Trung điểm & Đoạn thẳng */}
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 block">1. Trung điểm & Đoạn thẳng:</span>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={show3DMidpoints}
                      onChange={(e) => setShow3DMidpoints(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Hiện trung điểm các cạnh (M, N, P, Q)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={show3DBaseDiagonals}
                      onChange={(e) => setShow3DBaseDiagonals(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Vẽ đường chéo đáy (AC, BD) & Gốc O</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={show3DMidpointSegments}
                      onChange={(e) => setShow3DMidpointSegments(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Vẽ đoạn thẳng nối trung điểm (MN, NP, PM)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={show3DAltitudeSO}
                      onChange={(e) => setShow3DAltitudeSO(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Vẽ đường cao từ đỉnh (SO ⊥ đáy)</span>
                  </label>
                </div>

                {/* 2. Thao tác Vẽ Mặt Phẳng Thiết Diện Trong Không Gian */}
                <div className="space-y-2 bg-gradient-to-r from-amber-50/60 to-purple-50/60 p-3 rounded-2xl border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1">
                      <Layers size={13} className="text-amber-600" />
                      <span>2. Vẽ Mặt Phẳng Thiết Diện (3D Planes):</span>
                    </span>
                  </div>

                  <select
                    value={selectedCuttingPlane}
                    onChange={(e) => setSelectedCuttingPlane(e.target.value as any)}
                    className="w-full h-8 px-2.5 rounded-xl border border-amber-300 bg-white font-bold text-[11px] text-slate-800 focus:outline-none"
                  >
                    <option value="none">-- Không vẽ mặt phẳng thiết diện --</option>
                    <option value="plane_mnp">Mặt phẳng thiết diện (MNP) cắt các cạnh</option>
                    <option value="plane_sac">Mặt phẳng chéo (SAC) qua đỉnh và AC</option>
                    <option value="plane_sbd">Mặt phẳng chéo (SBD) qua đỉnh và BD</option>
                    <option value="plane_parallel">Mặt phẳng (α) song song đáy</option>
                  </select>

                  {selectedCuttingPlane !== 'none' && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span>Tông màu mặt phẳng:</span>
                        <div className="flex items-center gap-1">
                          {(['amber', 'violet', 'emerald', 'cyan'] as const).map((thm) => (
                            <button
                              key={thm}
                              type="button"
                              onClick={() => setPlaneColorTheme(thm)}
                              className={`w-4 h-4 rounded-full border ${
                                planeColorTheme === thm ? 'ring-2 ring-slate-800 scale-110' : ''
                              } ${
                                thm === 'amber'
                                  ? 'bg-amber-400 border-amber-500'
                                  : thm === 'violet'
                                  ? 'bg-violet-400 border-violet-500'
                                  : thm === 'emerald'
                                  ? 'bg-emerald-400 border-emerald-500'
                                  : 'bg-cyan-400 border-cyan-500'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span>Độ trong suốt: {Math.round(planeOpacity * 100)}%</span>
                        <input
                          type="range"
                          min="0.15"
                          max="0.75"
                          step="0.05"
                          value={planeOpacity}
                          onChange={(e) => setPlaneOpacity(parseFloat(e.target.value))}
                          className="w-24 h-1 bg-amber-200 rounded accent-amber-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
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

              {/* ========================================================= */}
              {/* THANH CÔNG CỤ TỰ VẼ 2D: ĐOẠN THẲNG, TRUNG ĐIỂM, ĐƯỜNG CAO */}
              {/* ========================================================= */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                    <PenTool size={14} className="text-blue-600" />
                    <span>Công Cụ Tự Thao Tác Vẽ Hình 2D:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleReset2DCustom}
                    title="Xóa các đường vẽ thêm & khôi phục hình gốc"
                    className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                  >
                    <RotateCcw size={11} />
                    <span>Làm mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTool2D('pointer');
                      setSelectedPointsForTool([]);
                      setToolStatusMessage('Chế độ Di chuyển: Nhấp giữ chuột vào điểm bất kỳ để kéo thả thay đổi vị trí.');
                    }}
                    className={`p-2 rounded-xl border text-left font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                      tool2D === 'pointer'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <MousePointer size={14} />
                    <span>Kéo & Di Chuyển</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTool2D('segment');
                      setSelectedPointsForTool([]);
                      setToolStatusMessage('Chế độ Vẽ đoạn thẳng: Nhấp chọn 2 điểm trên hình để nối đoạn thẳng.');
                    }}
                    className={`p-2 rounded-xl border text-left font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                      tool2D === 'segment'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <PenTool size={14} />
                    <span>Vẽ Đoạn Thẳng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTool2D('midpoint');
                      setSelectedPointsForTool([]);
                      setToolStatusMessage('Chế độ Trung điểm: Nhấp chọn 2 điểm để tự động tính và tạo trung điểm (M, N, P...).');
                    }}
                    className={`p-2 rounded-xl border text-left font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                      tool2D === 'midpoint'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Ruler size={14} />
                    <span>Tạo Trung Điểm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTool2D('altitude');
                      setSelectedPointsForTool([]);
                      setToolStatusMessage('Chế độ Đường cao: Nhấp 1 đỉnh và 2 điểm đáy để hạ đường vuông góc.');
                    }}
                    className={`p-2 rounded-xl border text-left font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                      tool2D === 'altitude'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Square size={14} />
                    <span>Vẽ Đường Cao</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTool2D('add_point');
                      setSelectedPointsForTool([]);
                      setToolStatusMessage('Chế độ Thêm điểm: Nhấp vào bất kỳ vị trí nào trên bảng vẽ để tạo điểm mới.');
                    }}
                    className={`col-span-2 p-2 rounded-xl border text-left font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                      tool2D === 'add_point'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Plus size={14} />
                    <span>+ Nhấp Thêm Điểm Tự Do Lên Bảng Vẽ</span>
                  </button>
                </div>

                {/* Hướng dẫn thao tác hiện tại */}
                {toolStatusMessage && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold flex items-start gap-1.5 animate-in fade-in">
                    <Info size={13} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>{toolStatusMessage}</span>
                  </div>
                )}

                {/* Danh sách các nét đã vẽ thêm */}
                {(safeCustomSegments2D.length > 0 || safeCustomMidpoints2D.length > 0) && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Các nét đã vẽ thêm:</span>
                    <div className="flex flex-wrap gap-1">
                      {safeCustomSegments2D.map((seg) => (
                        <span
                          key={seg.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-mono font-bold"
                        >
                          <span>Đoạn [{seg.p1}{seg.p2}]</span>
                          <button
                            type="button"
                            onClick={() => setCustomSegments2D((prev) => Array.isArray(prev) ? prev.filter((s) => s.id !== seg.id) : [])}
                            className="hover:text-rose-600 font-bold ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {safeCustomMidpoints2D.map((mid) => (
                        <span
                          key={mid.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold"
                        >
                          <span>Trung điểm {mid.label} ({mid.p1}{mid.p2})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomMidpoints2D((prev) => Array.isArray(prev) ? prev.filter((m) => m.id !== mid.id) : []);
                              setPointCoordinates((prev) => {
                                const copy = { ...prev };
                                delete copy[mid.label];
                                return copy;
                              });
                            }}
                            className="hover:text-rose-600 font-bold ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                  const O = project3D(10, 0, 0); // Tâm đáy

                  // Trung điểm các cạnh trong không gian
                  const M = project3D(-a / 2, h / 2, b / 2); // Trung điểm SA
                  const N = project3D((a + 20) / 2, h / 2, -b / 2); // Trung điểm SC
                  const P = project3D(0, 0, b); // Trung điểm AB
                  const Q = project3D(20, 0, -b); // Trung điểm CD
                  const K = project3D(a / 2, h / 2, b / 2); // Trung điểm SB
                  const L = project3D((-a + 20) / 2, h / 2, -b / 2); // Trung điểm SD

                  const themeColors = {
                    amber: { fill: `rgba(245, 158, 11, ${planeOpacity})`, stroke: '#d97706', glow: '#fef3c7' },
                    violet: { fill: `rgba(139, 92, 246, ${planeOpacity})`, stroke: '#7c3aed', glow: '#ede9fe' },
                    emerald: { fill: `rgba(16, 185, 129, ${planeOpacity})`, stroke: '#059669', glow: '#d1fae5' },
                    cyan: { fill: `rgba(6, 182, 212, ${planeOpacity})`, stroke: '#0891b2', glow: '#cffafe' },
                  };
                  const activeColor = themeColors[planeColorTheme] || themeColors.amber;

                  return (
                    <g className="font-bold text-xs">
                      {/* Mặt đáy tô bóng */}
                      {showShading && (
                        <polygon
                          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`}
                          fill="rgba(59, 130, 246, 0.08)"
                        />
                      )}

                      {/* MẶT PHẲNG THIẾT DIỆN TRONG KHÔNG GIAN (3D CUTTING PLANES) */}
                      {selectedCuttingPlane === 'plane_mnp' && (
                        <g>
                          <polygon
                            points={`${M.x},${M.y} ${P.x},${P.y} ${Q.x},${Q.y} ${N.x},${N.y}`}
                            fill={activeColor.fill}
                            stroke={activeColor.stroke}
                            strokeWidth="2.2"
                          />
                          <text
                            x={(M.x + P.x) / 2 - 18}
                            y={(M.y + P.y) / 2}
                            fill={activeColor.stroke}
                            className="font-extrabold text-[11px]"
                          >
                            (MNPQ)
                          </text>
                        </g>
                      )}

                      {selectedCuttingPlane === 'plane_sac' && (
                        <polygon
                          points={`${S.x},${S.y} ${A.x},${A.y} ${C.x},${C.y}`}
                          fill={activeColor.fill}
                          stroke={activeColor.stroke}
                          strokeWidth="2"
                        />
                      )}

                      {selectedCuttingPlane === 'plane_sbd' && (
                        <polygon
                          points={`${S.x},${S.y} ${B.x},${B.y} ${D.x},${D.y}`}
                          fill={activeColor.fill}
                          stroke={activeColor.stroke}
                          strokeWidth="2"
                        />
                      )}

                      {selectedCuttingPlane === 'plane_parallel' && (
                        <polygon
                          points={`${M.x},${M.y} ${K.x},${K.y} ${N.x},${N.y} ${L.x},${L.y}`}
                          fill={activeColor.fill}
                          stroke={activeColor.stroke}
                          strokeWidth="2.2"
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
                        </>
                      )}

                      {/* ĐOẠN THẲNG KHÔNG GIAN: ĐƯỜNG CHÉO ĐÁY (AC, BD) */}
                      {show3DBaseDiagonals && (
                        <>
                          <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
                          <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
                          <circle cx={O.x} cy={O.y} r="2.8" fill="#475569" />
                          <text x={O.x + 5} y={O.y - 4} fill="#475569" className="text-[10px]">O</text>
                        </>
                      )}

                      {/* ĐOẠN THẲNG KHÔNG GIAN: ĐƯỜNG CAO TỪ ĐỈNH SO */}
                      {show3DAltitudeSO && (
                        <line x1={S.x} y1={S.y} x2={O.x} y2={O.y} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                      )}

                      {/* ĐOẠN THẲNG NỐI TRUNG ĐIỂM (MN, NP, PM) */}
                      {show3DMidpointSegments && (
                        <>
                          <line x1={M.x} y1={M.y} x2={N.x} y2={N.y} stroke={activeColor.stroke} strokeWidth="1.8" strokeDasharray="4 2" />
                          <line x1={N.x} y1={N.y} x2={P.x} y2={P.y} stroke={activeColor.stroke} strokeWidth="1.8" strokeDasharray="4 2" />
                          <line x1={P.x} y1={P.y} x2={M.x} y2={M.y} stroke={activeColor.stroke} strokeWidth="1.8" strokeDasharray="4 2" />
                        </>
                      )}

                      {/* Các cạnh bên thấy được */}
                      <line x1={S.x} y1={S.y} x2={A.x} y2={A.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {/* TRUNG ĐIỂM CÁC CẠNH (M, N, P, Q) */}
                      {show3DMidpoints && (
                        <g>
                          {[
                            { pt: M, label: 'M (SA)', dx: -18, dy: -4 },
                            { pt: N, label: 'N (SC)', dx: 8, dy: -4 },
                            { pt: P, label: 'P (AB)', dx: -6, dy: 14 },
                            { pt: Q, label: 'Q (CD)', dx: -6, dy: -8 },
                          ].map((item, idx) => (
                            <g key={idx}>
                              <circle cx={item.pt.x} cy={item.pt.y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                              <text x={item.pt.x + item.dx} y={item.pt.y + item.dy} fill="#065f46" className="text-[10px] font-mono">
                                {item.label}
                              </text>
                            </g>
                          ))}
                        </g>
                      )}

                      {/* Điểm đỉnh và Nhãn đỉnh chính */}
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
                  const G = project3D(20 / 3, 0, 20); // Trọng tâm đáy

                  // Trung điểm
                  const M = project3D(-45, h / 2, 35); // Trung điểm SA
                  const N = project3D(45, h / 2, 35); // Trung điểm SB
                  const P = project3D(10, h / 2, -40); // Trung điểm SC
                  const D = project3D(0, 0, 70); // Trung điểm AB

                  const themeColors = {
                    amber: { fill: `rgba(245, 158, 11, ${planeOpacity})`, stroke: '#d97706' },
                    violet: { fill: `rgba(139, 92, 246, ${planeOpacity})`, stroke: '#7c3aed' },
                    emerald: { fill: `rgba(16, 185, 129, ${planeOpacity})`, stroke: '#059669' },
                    cyan: { fill: `rgba(6, 182, 212, ${planeOpacity})`, stroke: '#0891b2' },
                  };
                  const activeColor = themeColors[planeColorTheme] || themeColors.amber;

                  return (
                    <g className="font-bold text-xs">
                      {showShading && (
                        <polygon
                          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                          fill="rgba(99, 102, 241, 0.08)"
                        />
                      )}

                      {/* Mặt phẳng thiết diện (MNP) */}
                      {selectedCuttingPlane === 'plane_mnp' && (
                        <polygon
                          points={`${M.x},${M.y} ${N.x},${N.y} ${P.x},${P.y}`}
                          fill={activeColor.fill}
                          stroke={activeColor.stroke}
                          strokeWidth="2.2"
                        />
                      )}

                      {selectedCuttingPlane === 'plane_parallel' && (
                        <polygon
                          points={`${M.x},${M.y} ${N.x},${N.y} ${P.x},${P.y}`}
                          fill={activeColor.fill}
                          stroke={activeColor.stroke}
                          strokeWidth="2.2"
                        />
                      )}

                      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {showHiddenLines && (
                        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
                      )}

                      {/* Đường cao & trung tuyến đáy */}
                      {show3DAltitudeSO && (
                        <line x1={S.x} y1={S.y} x2={G.x} y2={G.y} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                      )}
                      {show3DBaseDiagonals && (
                        <line x1={C.x} y1={C.y} x2={D.x} y2={D.y} stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
                      )}

                      {/* Đoạn thẳng nối trung điểm */}
                      {show3DMidpointSegments && (
                        <>
                          <line x1={M.x} y1={M.y} x2={N.x} y2={N.y} stroke={activeColor.stroke} strokeWidth="1.8" strokeDasharray="4 2" />
                          <line x1={N.x} y1={N.y} x2={P.x} y2={P.y} stroke={activeColor.stroke} strokeWidth="1.8" strokeDasharray="4 2" />
                          <line x1={P.x} y1={P.y} x2={M.x} y2={M.y} stroke={activeColor.stroke} strokeWidth="1.8" strokeDasharray="4 2" />
                        </>
                      )}

                      <line x1={S.x} y1={S.y} x2={A.x} y2={A.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={B.x} y2={B.y} stroke="#1e293b" strokeWidth="1.8" />
                      <line x1={S.x} y1={S.y} x2={C.x} y2={C.y} stroke="#1e293b" strokeWidth="1.8" />

                      {/* Trung điểm M, N, P */}
                      {show3DMidpoints && (
                        <g>
                          {[
                            { pt: M, label: 'M (SA)', dx: -18, dy: -2 },
                            { pt: N, label: 'N (SB)', dx: 8, dy: -2 },
                            { pt: P, label: 'P (SC)', dx: 8, dy: -6 },
                          ].map((item, idx) => (
                            <g key={idx}>
                              <circle cx={item.pt.x} cy={item.pt.y} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                              <text x={item.pt.x + item.dx} y={item.pt.y + item.dy} fill="#065f46" className="text-[10px] font-mono">
                                {item.label}
                              </text>
                            </g>
                          ))}
                        </g>
                      )}

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

                  // Trung điểm các cạnh đứng AA', BB', CC', DD'
                  const M = project3D(-s, h / 2, s);
                  const N = project3D(s, h / 2, s);
                  const P = project3D(s, h / 2, -s);
                  const Q = project3D(-s, h / 2, -s);

                  const themeColors = {
                    amber: { fill: `rgba(245, 158, 11, ${planeOpacity})`, stroke: '#d97706' },
                    violet: { fill: `rgba(139, 92, 246, ${planeOpacity})`, stroke: '#7c3aed' },
                    emerald: { fill: `rgba(16, 185, 129, ${planeOpacity})`, stroke: '#059669' },
                    cyan: { fill: `rgba(6, 182, 212, ${planeOpacity})`, stroke: '#0891b2' },
                  };
                  const activeColor = themeColors[planeColorTheme] || themeColors.amber;

                  return (
                    <g className="font-bold text-xs">
                      {/* Đáy trên thấy toàn bộ */}
                      <polygon
                        points={`${A1.x},${A1.y} ${B1.x},${B1.y} ${C1.x},${C1.y} ${D1.x},${D1.y}`}
                        fill="rgba(59, 130, 246, 0.12)"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                      />

                      {/* Mặt phẳng thiết diện chéo (ACC'A') */}
                      {selectedCuttingPlane === 'plane_sac' && (
                        <polygon
                          points={`${A.x},${A.y} ${C.x},${C.y} ${C1.x},${C1.y} ${A1.x},${A1.y}`}
                          fill={activeColor.fill}
                          stroke={activeColor.stroke}
                          strokeWidth="2"
                        />
                      )}

                      {/* Mặt phẳng thiết diện chéo (BDD'B') */}
                      {selectedCuttingPlane === 'plane_sbd' && (
                        <polygon
                          points={`${B.x},${B.y} ${D.x},${D.y} ${D1.x},${D1.y} ${B1.x},${B1.y}`}
                          fill={activeColor.fill}
                          stroke={activeColor.stroke}
                          strokeWidth="2"
                        />
                      )}

                      {/* Mặt phẳng thiết diện song song đáy hoặc qua 4 trung điểm (MNPQ) */}
                      {(selectedCuttingPlane === 'plane_parallel' || selectedCuttingPlane === 'plane_mnp') && (
                        <polygon
                          points={`${M.x},${M.y} ${N.x},${N.y} ${P.x},${P.y} ${Q.x},${Q.y}`}
                          fill={activeColor.fill}
                          stroke={activeColor.stroke}
                          strokeWidth="2.2"
                        />
                      )}

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

                      {/* Đường chéo đáy nếu bật */}
                      {show3DBaseDiagonals && (
                        <>
                          <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
                          <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
                        </>
                      )}

                      {/* Đoạn thẳng nối trung điểm */}
                      {show3DMidpointSegments && (
                        <>
                          <line x1={M.x} y1={M.y} x2={N.x} y2={N.y} stroke={activeColor.stroke} strokeWidth="1.6" strokeDasharray="4 2" />
                          <line x1={N.x} y1={N.y} x2={P.x} y2={P.y} stroke={activeColor.stroke} strokeWidth="1.6" strokeDasharray="4 2" />
                          <line x1={P.x} y1={P.y} x2={Q.x} y2={Q.y} stroke={activeColor.stroke} strokeWidth="1.6" strokeDasharray="4 2" />
                          <line x1={Q.x} y1={Q.y} x2={M.x} y2={M.y} stroke={activeColor.stroke} strokeWidth="1.6" strokeDasharray="4 2" />
                        </>
                      )}

                      {/* Trung điểm M, N, P, Q */}
                      {show3DMidpoints && (
                        <g>
                          {[
                            { pt: M, label: 'M (AA\')', dx: -20, dy: 0 },
                            { pt: N, label: 'N (BB\')', dx: 8, dy: 0 },
                            { pt: P, label: 'P (CC\')', dx: 8, dy: -4 },
                            { pt: Q, label: 'Q (DD\')', dx: -20, dy: -4 },
                          ].map((item, idx) => (
                            <g key={idx}>
                              <circle cx={item.pt.x} cy={item.pt.y} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                              <text x={item.pt.x + item.dx} y={item.pt.y + item.dy} fill="#065f46" className="text-[10px] font-mono">
                                {item.label}
                              </text>
                            </g>
                          ))}
                        </g>
                      )}

                      {[
                        { pt: A, label: 'A', dx: -12, dy: 12 },
                        { pt: B, label: 'B', dx: 8, dy: 12 },
                        { pt: C, label: 'C', dx: 10, dy: 0 },
                        { pt: D, label: 'D', dx: -14, dy: -4 },
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
                className={`w-full h-full ${tool2D === 'add_point' ? 'cursor-crosshair' : ''}`}
                onClick={handleSvgCanvasClick}
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

                {/* CÁC ĐOẠN THẲNG TỰ VẼ 2D (CUSTOM SEGMENTS) */}
                {safeCustomSegments2D.map((seg) => {
                  const p1 = pointCoordinates[seg.p1];
                  const p2 = pointCoordinates[seg.p2];
                  if (!p1 || !p2) return null;
                  const d = calcDist(p1, p2);

                  return (
                    <g key={seg.id}>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={seg.color || strokeColor}
                        strokeWidth="2.2"
                        strokeDasharray={seg.style === 'dashed' ? '4 3' : undefined}
                      />
                      <text
                        x={(p1.x + p2.x) / 2}
                        y={(p1.y + p2.y) / 2 - 6}
                        fill={seg.color || strokeColor}
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold"
                      >
                        {d} px
                      </text>
                    </g>
                  );
                })}

                {/* Các điểm điều khiển kéo thả & nhấp tương tác (Control Points) */}
                {Object.entries(pointCoordinates).map(([name, pt]) => {
                  const isSelectedForTool = safeSelectedPointsForTool.includes(name);
                  const isMidpoint = safeCustomMidpoints2D.some((m) => m.label === name);

                  return (
                    <g
                      key={name}
                      className={tool2D === 'pointer' ? 'cursor-move' : 'cursor-pointer'}
                      onClick={(e) => handlePointClick2D(name, e)}
                      onMouseDown={(e) => {
                        if (tool2D === 'pointer') {
                          e.stopPropagation();
                          setDraggedPoint(name);
                        }
                      }}
                    >
                      {/* Vòng sáng nếu điểm đang được chọn bởi công cụ */}
                      {isSelectedForTool && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="14"
                          fill="rgba(245, 158, 11, 0.25)"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          className="animate-pulse"
                        />
                      )}

                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        fill={isMidpoint ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill={isMidpoint ? '#10b981' : isSelectedForTool ? '#f59e0b' : '#ef4444'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pt.x + 8}
                        y={pt.y - 8}
                        fill={isMidpoint ? '#065f46' : '#0f172a'}
                        className="font-extrabold text-xs"
                      >
                        {name}
                      </text>
                    </g>
                  );
                })}
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
