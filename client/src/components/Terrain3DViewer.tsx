import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Environment } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Terrain3DViewerProps {
  polygonCoordinates?: string;
  buildingFootprint?: number; // área construída em m²
  buildingHeight?: number; // altura em metros
  parkingSpaces?: number;
}

function TerrainMesh({ coordinates }: { coordinates: Array<{ lat: number; lng: number }> }) {
  const shape = useMemo(() => {
    if (coordinates.length < 3) return null;
    
    // Converter coordenadas geográficas para coordenadas locais em metros
    // Usar o primeiro ponto como origem
    const origin = coordinates[0];
    const localPoints = coordinates.map(coord => {
      // Aproximação simples: 1 grau de latitude ≈ 111km, longitude varia com latitude
      const latDiff = (coord.lat - origin.lat) * 111000;
      const lngDiff = (coord.lng - origin.lng) * 111000 * Math.cos(origin.lat * Math.PI / 180);
      return new THREE.Vector2(lngDiff, latDiff);
    });
    
    const shape = new THREE.Shape(localPoints);
    return shape;
  }, [coordinates]);
  
  if (!shape) return null;
  
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial 
        color="#90EE90" 
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

function BuildingMesh({ 
  coordinates, 
  footprint, 
  height 
}: { 
  coordinates: Array<{ lat: number; lng: number }>; 
  footprint: number;
  height: number;
}) {
  const buildingShape = useMemo(() => {
    if (coordinates.length < 3) return null;
    
    // Criar retângulo simplificado para o edifício (80% do terreno)
    const origin = coordinates[0];
    const localPoints = coordinates.map(coord => {
      const latDiff = (coord.lat - origin.lat) * 111000;
      const lngDiff = (coord.lng - origin.lng) * 111000 * Math.cos(origin.lat * Math.PI / 180);
      return new THREE.Vector2(lngDiff, latDiff);
    });
    
    // Calcular centro e dimensões
    const minX = Math.min(...localPoints.map(p => p.x));
    const maxX = Math.max(...localPoints.map(p => p.x));
    const minY = Math.min(...localPoints.map(p => p.y));
    const maxY = Math.max(...localPoints.map(p => p.y));
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const width = (maxX - minX) * 0.8;
    const depth = (maxY - minY) * 0.8;
    
    // Criar retângulo para o edifício
    const shape = new THREE.Shape();
    shape.moveTo(centerX - width/2, centerY - depth/2);
    shape.lineTo(centerX + width/2, centerY - depth/2);
    shape.lineTo(centerX + width/2, centerY + depth/2);
    shape.lineTo(centerX - width/2, centerY + depth/2);
    shape.lineTo(centerX - width/2, centerY - depth/2);
    
    return shape;
  }, [coordinates]);
  
  if (!buildingShape) return null;
  
  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <extrudeGeometry 
        args={[
          buildingShape, 
          { 
            depth: height, 
            bevelEnabled: false,
          }
        ]} 
      />
      <meshStandardMaterial 
        color="#E8E8E8" 
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  );
}

function ParkingLot({ 
  coordinates, 
  spaces 
}: { 
  coordinates: Array<{ lat: number; lng: number }>; 
  spaces: number;
}) {
  const parkingGeometry = useMemo(() => {
    if (coordinates.length < 3) return null;
    
    const origin = coordinates[0];
    const localPoints = coordinates.map(coord => {
      const latDiff = (coord.lat - origin.lat) * 111000;
      const lngDiff = (coord.lng - origin.lng) * 111000 * Math.cos(origin.lat * Math.PI / 180);
      return new THREE.Vector2(lngDiff, latDiff);
    });
    
    // Calcular área de estacionamento (20% do terreno, na frente)
    const minX = Math.min(...localPoints.map(p => p.x));
    const maxX = Math.max(...localPoints.map(p => p.x));
    const minY = Math.min(...localPoints.map(p => p.y));
    const maxY = Math.max(...localPoints.map(p => p.y));
    
    const width = maxX - minX;
    const depth = (maxY - minY) * 0.3; // 30% da profundidade para estacionamento
    
    return { x: minX, y: minY, width, depth };
  }, [coordinates]);
  
  if (!parkingGeometry) return null;
  
  return (
    <mesh 
      position={[
        parkingGeometry.x + parkingGeometry.width / 2, 
        0.05, 
        parkingGeometry.y + parkingGeometry.depth / 2
      ]} 
      rotation-x={-Math.PI / 2}
      receiveShadow
    >
      <planeGeometry args={[parkingGeometry.width, parkingGeometry.depth]} />
      <meshStandardMaterial 
        color="#404040" 
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function Terrain3DViewer({ 
  polygonCoordinates, 
  buildingFootprint = 1000,
  buildingHeight = 5,
  parkingSpaces = 40
}: Terrain3DViewerProps) {
  const coordinates = useMemo(() => {
    if (!polygonCoordinates) return [];
    try {
      const parsed = JSON.parse(polygonCoordinates);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [polygonCoordinates]);
  
  if (coordinates.length < 3) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">
          Desenhe um polígono no mapa para visualizar em 3D
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-[500px] bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[50, 40, 50]} fov={50} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Iluminação */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <hemisphereLight args={['#87CEEB', '#90EE90', 0.3]} />
        
        {/* Ambiente */}
        <Environment preset="city" />
        
        {/* Grid de referência */}
        <Grid 
          args={[200, 200]} 
          cellSize={5} 
          cellThickness={0.5} 
          cellColor="#6B7280" 
          sectionSize={10} 
          sectionThickness={1} 
          sectionColor="#374151" 
          fadeDistance={150}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
        
        {/* Terreno */}
        <TerrainMesh coordinates={coordinates} />
        
        {/* Estacionamento */}
        <ParkingLot coordinates={coordinates} spaces={parkingSpaces} />
        
        {/* Edifício */}
        <BuildingMesh 
          coordinates={coordinates} 
          footprint={buildingFootprint}
          height={buildingHeight}
        />
      </Canvas>
    </div>
  );
}
