import React from "react";
import Particles from "react-tsparticles";

function SnowParticles() {
  return (
    <Particles
      options={{
        fullScreen: { enable: false },

        background: {
          color: "transparent",
        },

        particles: {
          number: {
            value: 40,
          },

          shape: {
            type: "image",
            image: [
              {
                src: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
                width: 100,
                height: 100,
              },
            ],
          },

          size: {
            value: { min: 10, max: 25 },
          },

          opacity: {
            value: 0.4,
          },

          move: {
            enable: true,
            speed: 1,
            direction: "bottom",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
          },
        },
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}

export default SnowParticles;