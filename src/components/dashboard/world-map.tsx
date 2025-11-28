'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { exchanges, cloudRegions } from '@/lib/data';
import type { LatencyData, Exchange, CloudRegion } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

type WorldMapProps = {
  latencyData: LatencyData[];
  filters: any;
  isRotating: boolean;
};

const providerColors: Record<string, THREE.Color> = {
  AWS: new THREE.Color('#FF9900'),
  GCP: new THREE.Color('#4285F4'),
  Azure: new THREE.Color('#0078D4'),
  Other: new THREE.Color('#9E9E9E'),
};

const latencyColor = (latency: number): THREE.Color => {
  if (latency < 0) return new THREE.Color('#a855f7'); // Special color for topology
  if (latency < 50) return new THREE.Color('#22c55e'); // green
  if (latency < 150) return new THREE.Color('#facc15'); // yellow
  return new THREE.Color('#ef4444'); // red
};

const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

const WorldMap: React.FC<WorldMapProps> = ({ latencyData, filters, isRotating }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const connectionsGroupRef = useRef<THREE.Group | null>(null);
  const pulsesGroupRef = useRef<THREE.Group | null>(null);
  
  const animationFrameId = useRef<number>();
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const clockRef = useRef(new THREE.Clock());

  const isRotatingRef = useRef(isRotating);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  const renderScene = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);


  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
        75,
        currentMount.clientWidth / currentMount.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 15;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    const radius = 5;
    const globeGeometry = new THREE.SphereGeometry(radius, 64, 64);
    
    const textureLoader = new THREE.TextureLoader();
    const globeGroup = new THREE.Group();
    globeRef.current = globeGroup;
    scene.add(globeGroup);

    textureLoader.load(
      'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg',
      (texture) => {
        const globeMaterial = new THREE.MeshPhongMaterial({
          map: texture,
          color: new THREE.Color(0x8ab4f8),
          emissive: new THREE.Color(0x111122), // A dark blue emissive color for the oceans
          emissiveIntensity: 0.4,
          shininess: 10,
        });

        const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
        globeGroup.add(globeMesh);

        setLoading(false); 
      },
      undefined,
      (error) => {
        console.error('An error occurred while loading the texture.', error);
        const fallbackMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x0a192f), // Dark blue
            shininess: 5,
        });
        const globeMesh = new THREE.Mesh(globeGeometry, fallbackMaterial);
        globeGroup.add(globeMesh);
        setLoading(false);
      }
    );
    
    markersGroupRef.current = new THREE.Group();
    globeGroup.add(markersGroupRef.current);
    connectionsGroupRef.current = new THREE.Group();
    globeGroup.add(connectionsGroupRef.current);
    pulsesGroupRef.current = new THREE.Group();
    globeGroup.add(pulsesGroupRef.current);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);
    
    const onMouseDown = (e: MouseEvent) => { 
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.offsetX, y: e.offsetY }; 
    };
    const onMouseUp = () => { isDraggingRef.current = false; };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !globeRef.current) return;
      const deltaMove = {
        x: e.offsetX - previousMousePositionRef.current.x,
        y: e.offsetY - previousMousePositionRef.current.y,
      };
      globeRef.current.rotation.y += deltaMove.x * 0.005;
      globeRef.current.rotation.x += deltaMove.y * 0.005;
      previousMousePositionRef.current = { x: e.offsetX, y: e.offsetY };
    };

    const onWheel = (e: WheelEvent) => {
        if (!cameraRef.current) return;
        cameraRef.current.position.z = Math.min(Math.max(cameraRef.current.position.z + e.deltaY * 0.01, 8), 30);
    };
    
    currentMount.addEventListener('mousedown', onMouseDown);
    currentMount.addEventListener('mouseup', onMouseUp);
    currentMount.addEventListener('mousemove', onMouseMove);
    currentMount.addEventListener('wheel', onWheel);

    const handleResize = () => {
      if (!currentMount || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      
      if (isRotatingRef.current && !isDraggingRef.current) {
        if (globeRef.current) globeRef.current.rotation.y += 0.0005;
      }
      
      const elapsedTime = clockRef.current.getElapsedTime();
      
      pulsesGroupRef.current?.children.forEach(child => {
        const pulse = child as THREE.Mesh;
        const curve = pulse.userData.curve as THREE.CubicBezierCurve3;
        const speed = pulse.userData.speed as number;

        let t = (elapsedTime * speed) % 1;
        
        curve.getPointAt(t, pulse.position);
      });

      renderScene();
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('mousedown', onMouseDown);
      currentMount.removeEventListener('mouseup', onMouseUp);
      currentMount.removeEventListener('mousemove', onMouseMove);
      currentMount.removeEventListener('wheel', onWheel);
      if (rendererRef.current?.domElement && currentMount.contains(rendererRef.current.domElement)) {
         currentMount.removeChild(rendererRef.current.domElement);
      }
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [renderScene]);

  useEffect(() => {
    if (loading) return;
    const radius = 5;
    const allPoints = [...exchanges, ...cloudRegions];
    const points3D: { [key: string]: THREE.Vector3 } = {};
    allPoints.forEach(p => {
        points3D[p.id] = latLonToVector3(p.location.lat, p.location.lon, radius);
    });

    const updateScene = () => {
        const markersGroup = markersGroupRef.current;
        const connectionsGroup = connectionsGroupRef.current;
        const pulsesGroup = pulsesGroupRef.current;
        if (!markersGroup || !connectionsGroup || !pulsesGroup) return;

        while (markersGroup.children.length > 0) markersGroup.remove(markersGroup.children[0]);
        while (connectionsGroup.children.length > 0) connectionsGroup.remove(connectionsGroup.children[0]);
        while (pulsesGroup.children.length > 0) pulsesGroup.remove(pulsesGroup.children[0]);
        
        const allNodes = new Map((allPoints as (Exchange | CloudRegion)[]).map(p => [p.id, p]));
        const visibleNodes = new Set<string>();

        const isNodeVisible = (node: Exchange | CloudRegion) => {
            const isExchange = 'serverCount' in node === false;
            if (isExchange) {
                if (filters.exchanges.length > 0 && !filters.exchanges.includes(node.id)) {
                    return false;
                }
            } else { // It's a CloudRegion
                if (filters.providers.length > 0 && !filters.providers.includes((node as CloudRegion).provider)) {
                    return false;
                }
                if (!filters.showRegions) {
                    return false;
                }
            }
            return true;
        };
        

        allPoints.forEach(p => {
            if (isNodeVisible(p)) {
                visibleNodes.add(p.id);
            }
        });

        visibleNodes.forEach(nodeId => {
            const p = allNodes.get(nodeId)!;
            const isExchange = 'serverCount' in p === false;
            let markerGeometry: THREE.BufferGeometry;
            let markerMaterial: THREE.MeshBasicMaterial;

            if (isExchange) {
                const exchange = p as Exchange;
                markerGeometry = new THREE.SphereGeometry(0.08, 64, 64);
                markerMaterial = new THREE.MeshBasicMaterial({ color: providerColors[exchange.provider] || providerColors.Other });
            } else {
                const region = p as CloudRegion;
                markerGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.01);
                markerMaterial = new THREE.MeshBasicMaterial({ color: providerColors[region.provider] || providerColors.Other });
            }
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(points3D[p.id]);

            // Orient the marker to be "upright" on the sphere's surface
            const lookup = new THREE.Vector3(0,0,-1); // A point in the direction of the north pole
            marker.lookAt(lookup);
            marker.userData = { type: isExchange ? 'Exchange' : 'Cloud Region', data: p };
            markersGroup.add(marker);
        });

        const drawConnections = (connections: LatencyData[]) => {
          const pulseGeometry = new THREE.SphereGeometry(0.06, 8, 8);
          connections.forEach(conn => {
            if (conn.latency > filters.latencyRange[1]) return;
            if (!visibleNodes.has(conn.from) || !visibleNodes.has(conn.to)) return;

            const start = points3D[conn.from];
            const end = points3D[conn.to];
            if (!start || !end) return;

            const distance = start.distanceTo(end);
            const mid = start.clone().lerp(end, 0.5);
            const midLength = mid.length();
            mid.normalize();
            mid.multiplyScalar(midLength + distance * 0.4);

            let curve: THREE.CubicBezierCurve3;
            let material: THREE.LineBasicMaterial;

            const normal = new THREE.Vector3().subVectors(start, end).normalize();
            const midStart = mid.clone().add(normal.clone().multiplyScalar(distance * 0.2));
            const midEnd = mid.clone().add(normal.clone().multiplyScalar(-distance * 0.2));
            curve = new THREE.CubicBezierCurve3(start, midStart, midEnd, end);
            material = new THREE.LineBasicMaterial({ 
                color: latencyColor(conn.latency),
                transparent: true,
                opacity: 0.9,
                linewidth: 1.5,
            });
            
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const curveObject = new THREE.Line(geometry, material);
            connectionsGroup.add(curveObject);
            
            const pulseMaterial = new THREE.MeshBasicMaterial({ color: latencyColor(conn.latency) });
            const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
            pulse.userData.curve = curve;
            pulse.userData.speed = 0.2 + (Math.random() - 0.5) * 0.05;
            pulsesGroup.add(pulse);
          });
        };
        
        if (filters.showConnections) {
            drawConnections(latencyData);
        }
    }
    updateScene();
  }, [latencyData, filters, loading]);

  useEffect(() => {
    if (loading) return;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const markersGroup = markersGroupRef.current;
    const currentMount = mountRef.current;
    
    if (!renderer || !scene || !camera || !markersGroup || !currentMount) return;

    let hoveredObject: THREE.Object3D | null = null;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onHover = (e: MouseEvent) => {
        if (isDraggingRef.current) return;
        if (!renderer.domElement) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markersGroup.children);

        if (intersects.length > 0) {
            if (hoveredObject !== intersects[0].object) {
                hoveredObject = intersects[0].object;
            }
        } else {
            hoveredObject = null;
        }

        if (tooltipRef.current) {
            if (hoveredObject) {
                const data = hoveredObject.userData.data;
                const type = hoveredObject.userData.type;
                const provider = (data as any).provider;
                tooltipRef.current.style.display = 'block';
                tooltipRef.current.innerHTML = `
                    <div class="font-bold text-base">${data.name}</div>
                    <div class="text-sm">${type}</div>
                    ${data.location.city ? `<div class="text-xs">${data.location.city}, ${data.location.country}</div>` : ''}
                    <div class="text-xs">Provider: ${provider}</div>
                `;
                tooltipRef.current.style.left = `${e.clientX + 15}px`;
                tooltipRef.current.style.top = `${e.clientY + 15}px`;
            } else {
                tooltipRef.current.style.display = 'none';
            }
        }
    };
    
    const onMouseOut = () => {
        mouse.x = -100;
        mouse.y = -100;
        hoveredObject = null;
        if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
        }
    };
    
    const hoverMouseMove = (e:MouseEvent) => {
        onHover(e);
    };


    currentMount.addEventListener('mousemove', hoverMouseMove);
    currentMount.addEventListener('mouseleave', onMouseOut);
    
    return () => {
        currentMount.removeEventListener('mousemove', hoverMouseMove);
        currentMount.removeEventListener('mouseleave', onMouseOut);
    }
  }, [loading]);

  return (
    <div className="relative h-full w-full">
      {loading && <Skeleton className="absolute inset-0 h-full w-full" />}
      <div ref={mountRef} className="h-full w-full" />
      <div 
        ref={tooltipRef} 
        className="absolute p-2 rounded bg-card/80 backdrop-blur-sm border border-border text-card-foreground text-xs pointer-events-none shadow-lg"
        style={{ display: 'none' }}
      ></div>
    </div>
  );
};

export default WorldMap;
