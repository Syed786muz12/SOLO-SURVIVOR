// src/components/HeroModel.js
import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function HeroModel(props) {
  const group = useRef();
  const { scene, animations } = useGLTF('../assets/hero.glb');
  const { actions} = useAnimations(animations, group);

  // Play first animation if available
  useEffect(() => {
    if (actions && animations.length > 0) {
      actions[animations[0].name]?.play();
    }
  }, [actions, animations]);

  // Slowly rotate the model
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={group} {...props} dispose={null} scale={1.3} position={[0, -1.5, 0]}>
      <primitive object={scene} />
    </group>
  );
}
