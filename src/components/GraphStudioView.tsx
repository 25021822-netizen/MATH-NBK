import React, { useEffect, useRef, useState } from 'react';
import { FunctionGrapher } from './FunctionGrapher';
import { Box, RotateCw } from 'lucide-react';

const SURFACES = [
  { id: 'paraboloid', name: 'Paraboloid', equation: 'z = x² + y²', evaluate: (x: number, y: number) => (x * x + y * y) / 4 },
  { id: 'saddle', name: 'Mặt yên ngựa', equation: 'z = x² - y²', evaluate: (x: number, y: number) => (x * x - y * y) / 4 },
  { id: 'wave', name: 'Mặt sóng', equation: 'z = sin(x) · cos(y)', evaluate: (x: number, y: number) => Math.sin(x) * Math.cos(y) },
];

function SurfacePlot({ surfaceIndex, angle, elevation }: { surfaceIndex: number; angle: number; elevation: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surface = SURFACES[surfaceIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const { width, height } = canvas;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, width, height);

    const project = (x: number, y: number, z: number): [number, number] => {
      const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
      const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
      const depth = rotatedX + rotatedY;
      const vertical = depth * Math.sin(elevation) - z * Math.cos(elevation);
      return [width / 2 + (rotatedX - rotatedY) * 25, height * 0.58 + vertical * 27];
    };

    context.lineWidth = 1;
    for (let grid = -4; grid <= 4; grid += 0.5) {
      for (const fixed of [true, false]) {
        context.beginPath();
        for (let step = -4; step <= 4; step += 0.08) {
          const x = fixed ? grid : step;
          const y = fixed ? step : grid;
          const point = project(x, y, surface.evaluate(x, y));
          if (step === -4) context.moveTo(...point);
          else context.lineTo(...point);
        }
        context.strokeStyle = fixed ? 'rgba(37, 99, 235, 0.42)' : 'rgba(99, 102, 241, 0.32)';
        context.stroke();
      }
    }
  }, [angle, surface]);

  return <canvas ref={canvasRef} width={640} height={420} aria-label={`Đồ thị 3D ${surface.name}`} className="w-full rounded-2xl border border-slate-200 bg-slate-50" />;
}

export const GraphStudioView: React.FC = () => {
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [surfaceIndex, setSurfaceIndex] = useState(0);
  const [angle, setAngle] = useState(0.7);
  const [elevation, setElevation] = useState(0.55);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <header className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white"><Box size={24} /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Phòng Vẽ Toán Học 2D & 3D</h1>
            <p className="mt-1 text-sm text-slate-600">Trực quan hóa hàm số và khám phá hình dạng đồ thị.</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          {(['2d', '3d'] as const).map((value) => (
            <button key={value} onClick={() => setMode(value)} aria-pressed={mode === value} className={`rounded-xl px-5 py-2.5 text-sm font-bold ${mode === value ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>
              Đồ thị {value.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      {mode === '2d' ? (
        <FunctionGrapher />
      ) : (
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-sm font-bold text-slate-700">
              Chọn mặt 3D
              <select value={surfaceIndex} onChange={(event) => setSurfaceIndex(Number(event.target.value))} className="ml-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                {SURFACES.map((item, index) => <option key={item.id} value={index}>{item.name} — {item.equation}</option>)}
              </select>
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <RotateCw size={15} />
                Xoay ngang
                <input aria-label="Xoay ngang đồ thị 3D" type="range" min={0} max={6.28} step={0.05} value={angle} onChange={(event) => setAngle(Number(event.target.value))} className="accent-blue-600" />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                Góc nhìn cao
                <input aria-label="Độ cao góc nhìn đồ thị 3D" type="range" min={0.15} max={1.35} step={0.05} value={elevation} onChange={(event) => setElevation(Number(event.target.value))} className="accent-blue-600" />
              </label>
            </div>
          </div>
          <SurfacePlot surfaceIndex={surfaceIndex} angle={angle} elevation={elevation} />
          <p className="text-xs leading-relaxed text-slate-500">Điều chỉnh góc xoay ngang và độ cao góc nhìn; chọn bề mặt để so sánh z theo x, y.</p>
        </section>
      )}
    </div>
  );
};
