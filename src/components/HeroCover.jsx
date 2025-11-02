import React from 'react';
import Spline from '@splinetool/react-spline';

const HeroCover = () => {
  return (
    <section className="relative w-full h-[44vh] md:h-[56vh] lg:h-[64vh] overflow-hidden rounded-2xl shadow-lg">
      <Spline
        scene="https://prod.spline.design/qMOKV671Z1CM9yS7/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Gradient overlays for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="p-6 md:p-10 lg:p-14 text-white">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-xs md:text-sm backdrop-blur">
            FocusFlow — Study smarter, not harder
          </span>
          <h1 className="mt-3 md:mt-4 text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
            Track. Plan. Flow.
          </h1>
          <p className="mt-3 md:mt-4 max-w-xl text-sm md:text-base text-white/80">
            A modern study tracker and planner to log hours, set weekly goals, and visualize your progress — all in one calming space.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroCover;
