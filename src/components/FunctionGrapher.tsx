import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, LineChart, HelpCircle } from 'lucide-react';
import { MathView } from './MathView';

interface PresetFunction {
  id: string;
  name: string;
  formulaLatex: string;
  evaluate: (x: number) => number;
  derivative: (x: number) => number;
  domainDefault: [number, number];
}

const PRESET_FUNCTIONS: PresetFunction[] = [
  {
    id: 'cubic_1',
    name: 'Hàm bậc ba (Cực trị & Uốn)',
    formulaLatex: 'y = x^3 - 3x + 1',
    evaluate: (x) => Math.pow(x, 3) - 3 * x + 1,
    derivative: (x) => 3 * Math.pow(x, 2) - 3,
    domainDefault: [-3, 3],
  },
  {
    id: 'rational_1',
    name: 'Phân thức bậc nhất (Tiệm cận)',
    formulaLatex: 'y = \\frac{2x + 1}{x - 1}',
    evaluate: (x) => {
      if (Math.abs(x - 1) < 0.02) return NaN;
      return (2 * x + 1) / (x - 1);
    },
    derivative: (x) => {
      if (Math.abs(x - 1) < 0.02) return NaN;
      return -3 / Math.pow(x - 1, 2);
    },
    domainDefault: [-4, 6],
  },
  {
    id: 'quadratic_1',
    name: 'Parabol (Đỉnh & Trục đối xứng)',
    formulaLatex: 'y = -x^2 + 2x + 3',
    evaluate: (x) => -Math.pow(x, 2) + 2 * x + 3,
    derivative: (x) => -2 * x + 2,
    domainDefault: [-2, 4],
  },
  {
    id: 'trig_sin',
    name: 'Lượng giác tuần hoàn',
    formulaLatex: 'y = 2\\sin(x)',
    evaluate: (x) => 2 * Math.sin(x),
    derivative: (x) => 2 * Math.cos(x),
    domainDefault: [-6.5, 6.5],
  },
];

interface FunctionGrapherProps {
  initialFunctionId?: string;
  defaultEquation?: string;
  showControls?: boolean;
}

export const FunctionGrapher: React.FC<FunctionGrapherProps> = ({
  initialFunctionId = 'cubic_1',
  showControls = true,
}) => {
  const [selectedFuncId, setSelectedFuncId] = useState(initialFunctionId);
  const [tangentX, setTangentX] = useState<number>(0.5);
  const [showTangent, setShowTangent] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(45); // Pixels per unit
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeFunc = useMemo(() => {
    return PRESET_FUNCTIONS.find((f) => f.id === selectedFuncId) || PRESET_FUNCTIONS[0];
  }, [selectedFuncId]);

  // Vẽ đồ thị trên Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;

    // Xóa khung hình
    ctx.clearRect(0, 0, width, height);

    // 1. Vẽ lưới tọa độ (Grid)
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#E2E8F0'; // Slate-200
    const step = scale;

    // Lưới dọc
    for (let x = originX % step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // Lưới ngang
    for (let y = originY % step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Vẽ hai trục tọa độ Ox và Oy
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#475569'; // Slate-600
    // Ox
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Oy
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Mũi tên Ox, Oy & Nhãn O, x, y
    ctx.fillStyle = '#1E293B';
    ctx.font = '12px Plus Jakarta Sans, sans-serif';
    ctx.fillText('x', width - 15, originY - 8);
    ctx.fillText('y', originX + 8, 15);
    ctx.fillText('O', originX - 14, originY + 14);

    // Đánh số trên trục
    ctx.fillStyle = '#64748B';
    ctx.font = '10px monospace';
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      const px = originX + i * scale;
      const py = originY - i * scale;
      if (px > 0 && px < width) {
        ctx.fillText(i.toString(), px - 4, originY + 14);
      }
      if (py > 0 && py < height) {
        ctx.fillText(i.toString(), originX + 6, py + 4);
      }
    }

    // 3. Vẽ đường cong hàm số f(x)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2563EB'; // Blue-600
    ctx.beginPath();

    let isDrawing = false;
    for (let px = 0; px < width; px += 1) {
      const mathX = (px - originX) / scale;
      const mathY = activeFunc.evaluate(mathX);

      if (isNaN(mathY) || !isFinite(mathY) || Math.abs(mathY) > 50) {
        isDrawing = false;
        continue;
      }

      const py = originY - mathY * scale;
      if (!isDrawing) {
        ctx.moveTo(px, py);
        isDrawing = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // 4. Vẽ tiếp tuyến tại điểm x0 (Tangent line)
    if (showTangent) {
      const x0 = tangentX;
      const y0 = activeFunc.evaluate(x0);
      const k = activeFunc.derivative(x0);

      if (!isNaN(y0) && !isNaN(k) && isFinite(y0) && isFinite(k)) {
        const ptX = originX + x0 * scale;
        const ptY = originY - y0 * scale;

        // Vẽ đường tiếp tuyến: y - y0 = k(x - x0)
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#DC2626'; // Red-600
        ctx.beginPath();
        const startX = -10;
        const endX = 10;
        const startY = y0 + k * (startX - x0);
        const endY = y0 + k * (endX - x0);

        ctx.moveTo(originX + startX * scale, originY - startY * scale);
        ctx.lineTo(originX + endX * scale, originY - endY * scale);
        ctx.stroke();

        // Điểm tiếp xúc M(x0, y0)
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(ptX, ptY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [activeFunc, scale, tangentX, showTangent]);

  const tangentY = activeFunc.evaluate(tangentX);
  const tangentSlope = activeFunc.derivative(tangentX);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <LineChart size={18} className="text-blue-600" />
          <span className="font-semibold text-sm text-slate-900">Vẽ Đồ Thị Hàm Số Tương Tác</span>
        </div>

        {/* Function Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedFuncId}
            onChange={(e) => setSelectedFuncId(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRESET_FUNCTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
            <button
              onClick={() => setScale((s) => Math.min(s + 10, 80))}
              title="Phóng to"
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setScale((s) => Math.max(s - 10, 25))}
              title="Thu nhỏ"
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => {
                setScale(45);
                setTangentX(0.5);
              }}
              title="Đặt lại"
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Formula & Status Banner */}
      <div className="px-4 py-2 bg-blue-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Hàm số:</span>
          <MathView math={activeFunc.formulaLatex} />
        </div>
        {showTangent && !isNaN(tangentY) && (
          <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
            <span>M({tangentX.toFixed(2)}; {tangentY.toFixed(2)})</span>
            <span>Hệ số góc k = {tangentSlope.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="relative w-full overflow-hidden bg-slate-50/40 flex justify-center p-2">
        <canvas
          ref={canvasRef}
          width={560}
          height={320}
          className="rounded-xl border border-slate-200 bg-white max-w-full"
        />
      </div>

      {/* Interactive Tangent Slider */}
      {showControls && (
        <div className="px-4 py-3 bg-white border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showTangent}
                onChange={(e) => setShowTangent(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Hiển thị tiếp tuyến tại hoành độ x₀</span>
            </label>
            <span className="font-mono font-semibold text-blue-600 text-xs">x₀ = {tangentX.toFixed(2)}</span>
          </div>

          {showTangent && (
            <input
              type="range"
              min={-3}
              max={3}
              step={0.05}
              value={tangentX}
              onChange={(e) => setTangentX(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          )}
        </div>
      )}
    </div>
  );
};
