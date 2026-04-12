import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import useThemeStore from "../../hooks/useThemeStore";

export default function ParticleBackground() {
  const [init, setInit] = useState(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = {
    background: {
      color: "transparent",
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
      },
    },
    particles: {
      color: {
        value: theme === 'dark' ? "#00FF87" : "#008A4A",
      },
      links: {
        color: theme === 'dark' ? "#00FF87" : "#008A4A",
        distance: 150,
        enable: true,
        opacity: theme === 'dark' ? 0.15 : 0.08,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 0.5,
        straight: false,
      },
      number: { density: { enable: true, area: 800 }, value: 40 },
      opacity: { value: theme === 'dark' ? 0.3 : 0.1 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  if (init) {
    return <Particles id="tsparticles" className="fixed inset-0 -z-20 pointer-events-none" options={options} />;
  }

  return null;
}
