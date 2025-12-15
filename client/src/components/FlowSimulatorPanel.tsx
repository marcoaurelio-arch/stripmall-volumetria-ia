/**
 * Painel de Simulação de Fluxo de Pessoas
 * 
 * Simula circulação de pessoas no strip mall usando Matter.js
 */

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface FlowSimulatorPanelProps {
  projectId: number;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'peak';

interface SimulationMetrics {
  totalPeople: number;
  averageSpeed: number;
  bottlenecks: Array<{
    location: string;
    density: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  averageWaitTime: number;
}

export default function FlowSimulatorPanel({ projectId }: FlowSimulatorPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');
  const [speed, setSpeed] = useState([1]);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    totalPeople: 0,
    averageSpeed: 0,
    bottlenecks: [],
    averageWaitTime: 0
  });

  const { data: project } = trpc.project.get.useQuery({ id: projectId });
  const { data: analysis } = trpc.project.getLatestAnalysis.useQuery({ projectId });

  useEffect(() => {
    if (!canvasRef.current || !analysis) return;

    // Criar engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 } // Sem gravidade (vista de cima)
    });
    engineRef.current = engine;

    // Criar renderer
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#f5f5f5'
      }
    });
    renderRef.current = render;

    // Criar runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // Criar cenário do strip mall
    createStripMallScene(engine, analysis);

    // Iniciar render
    Matter.Render.run(render);

    // Cleanup
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [analysis]);

  /**
   * Cria cenário do strip mall
   */
  const createStripMallScene = (engine: Matter.Engine, analysis: any) => {
    const { world } = engine;

    // Dimensões do canvas
    const width = 800;
    const height = 600;

    // Criar paredes perimetrais
    const wallThickness = 20;
    const walls = [
      // Top
      Matter.Bodies.rectangle(width / 2, wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { fillStyle: '#333' }
      }),
      // Bottom
      Matter.Bodies.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { fillStyle: '#333' }
      }),
      // Left
      Matter.Bodies.rectangle(wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
        render: { fillStyle: '#333' }
      }),
      // Right
      Matter.Bodies.rectangle(width - wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
        render: { fillStyle: '#333' }
      })
    ];

    Matter.Composite.add(world, walls);

    // Criar lojas (retângulos ao longo da parede superior)
    const numberOfStores = analysis.numeroLojas || 8;
    const storeWidth = (width - 100) / numberOfStores;
    const storeHeight = 80;

    for (let i = 0; i < numberOfStores; i++) {
      const x = 50 + i * storeWidth + storeWidth / 2;
      const y = 60;

      const store = Matter.Bodies.rectangle(x, y, storeWidth - 10, storeHeight, {
        isStatic: true,
        render: { fillStyle: '#4CAF50' },
        label: `store_${i}`
      });

      Matter.Composite.add(world, store);

      // Criar entrada da loja
      const entranceWidth = 30;
      const entrance = Matter.Bodies.rectangle(x, y + storeHeight / 2 + 5, entranceWidth, 10, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#FFC107' },
        label: `entrance_${i}`
      });

      Matter.Composite.add(world, entrance);
    }

    // Criar área de estacionamento (parte inferior)
    const parkingArea = Matter.Bodies.rectangle(width / 2, height - 150, width - 100, 200, {
      isStatic: true,
      isSensor: true,
      render: { fillStyle: '#E0E0E0', opacity: 0.5 },
      label: 'parking'
    });

    Matter.Composite.add(world, parkingArea);

    // Criar pontos de entrada (estacionamento)
    const entryPoints = [
      { x: 150, y: height - 100 },
      { x: width / 2, y: height - 100 },
      { x: width - 150, y: height - 100 }
    ];

    entryPoints.forEach((point, index) => {
      const entry = Matter.Bodies.circle(point.x, point.y, 15, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: '#2196F3' },
        label: `entry_${index}`
      });

      Matter.Composite.add(world, entry);
    });
  };

  /**
   * Adiciona pessoas (agentes) à simulação
   */
  const addPeople = (count: number) => {
    if (!engineRef.current) return;

    const { world } = engineRef.current;
    const width = 800;
    const height = 600;

    for (let i = 0; i < count; i++) {
      // Posição inicial aleatória na área de estacionamento
      const x = 100 + Math.random() * (width - 200);
      const y = height - 150 + Math.random() * 100;

      const person = Matter.Bodies.circle(x, y, 8, {
        restitution: 0.3,
        friction: 0.1,
        frictionAir: 0.05,
        render: {
          fillStyle: '#FF5722'
        },
        label: 'person'
      });

      // Aplicar força inicial aleatória (movimento)
      const forceX = (Math.random() - 0.5) * 0.002;
      const forceY = -Math.random() * 0.003; // Tendência para cima (em direção às lojas)

      Matter.Body.applyForce(person, person.position, { x: forceX, y: forceY });

      Matter.Composite.add(world, person);
    }

    updateMetrics();
  };

  /**
   * Inicia simulação
   */
  const handleStart = () => {
    if (!engineRef.current || !runnerRef.current) return;

    // Determinar número de pessoas baseado no horário
    const peopleCount = {
      morning: 30,
      afternoon: 50,
      evening: 40,
      peak: 80
    }[timeOfDay];

    // Adicionar pessoas
    addPeople(peopleCount);

    // Iniciar runner
    Matter.Runner.run(runnerRef.current, engineRef.current);
    setIsRunning(true);

    // Atualizar métricas periodicamente
    const interval = setInterval(() => {
      updateMetrics();
    }, 1000);

    return () => clearInterval(interval);
  };

  /**
   * Pausa simulação
   */
  const handlePause = () => {
    if (!runnerRef.current) return;

    Matter.Runner.stop(runnerRef.current);
    setIsRunning(false);
  };

  /**
   * Reinicia simulação
   */
  const handleReset = () => {
    if (!engineRef.current) return;

    // Parar simulação
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }

    // Remover todas as pessoas
    const people = Matter.Composite.allBodies(engineRef.current.world).filter(
      body => body.label === 'person'
    );
    Matter.Composite.remove(engineRef.current.world, people);

    setIsRunning(false);
    setMetrics({
      totalPeople: 0,
      averageSpeed: 0,
      bottlenecks: [],
      averageWaitTime: 0
    });
  };

  /**
   * Atualiza métricas da simulação
   */
  const updateMetrics = () => {
    if (!engineRef.current) return;

    const people = Matter.Composite.allBodies(engineRef.current.world).filter(
      body => body.label === 'person'
    );

    // Calcular velocidade média
    const totalSpeed = people.reduce((sum, person) => {
      const velocity = Math.sqrt(person.velocity.x ** 2 + person.velocity.y ** 2);
      return sum + velocity;
    }, 0);
    const averageSpeed = people.length > 0 ? totalSpeed / people.length : 0;

    // Detectar gargalos (áreas com alta densidade)
    const bottlenecks = detectBottlenecks(people);

    setMetrics({
      totalPeople: people.length,
      averageSpeed: averageSpeed * 100, // Converter para escala legível
      bottlenecks,
      averageWaitTime: Math.random() * 30 // Simulado
    });
  };

  /**
   * Detecta gargalos na circulação
   */
  const detectBottlenecks = (people: Matter.Body[]): SimulationMetrics['bottlenecks'] => {
    const bottlenecks: SimulationMetrics['bottlenecks'] = [];

    // Dividir canvas em grid e contar pessoas em cada célula
    const gridSize = 100;
    const grid: Record<string, number> = {};

    people.forEach(person => {
      const cellX = Math.floor(person.position.x / gridSize);
      const cellY = Math.floor(person.position.y / gridSize);
      const key = `${cellX},${cellY}`;
      grid[key] = (grid[key] || 0) + 1;
    });

    // Identificar células com alta densidade
    Object.entries(grid).forEach(([key, count]) => {
      if (count > 5) {
        const [x, y] = key.split(',').map(Number);
        const location = y < 2 ? 'Área de Lojas' : 'Estacionamento';
        const severity = count > 10 ? 'high' : count > 7 ? 'medium' : 'low';

        bottlenecks.push({
          location,
          density: count,
          severity
        });
      }
    });

    return bottlenecks;
  };

  /**
   * Ajusta velocidade da simulação
   */
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.timing.timeScale = speed[0];
    }
  }, [speed]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Simulador de Fluxo de Pessoas
          </CardTitle>
          <CardDescription>
            Simula circulação de pessoas para identificar gargalos e otimizar layout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controles */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Horário</label>
              <Select value={timeOfDay} onValueChange={(v) => setTimeOfDay(v as TimeOfDay)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Manhã (30 pessoas)</SelectItem>
                  <SelectItem value="afternoon">Tarde (50 pessoas)</SelectItem>
                  <SelectItem value="evening">Noite (40 pessoas)</SelectItem>
                  <SelectItem value="peak">Horário de Pico (80 pessoas)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Velocidade: {speed[0]}x
              </label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={3}
                step={0.5}
                disabled={!isRunning}
              />
            </div>

            <div className="flex gap-2">
              {!isRunning ? (
                <Button onClick={handleStart}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              ) : (
                <Button onClick={handlePause} variant="secondary">
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </Button>
              )}
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          </div>

          {/* Canvas de Simulação */}
          <div className="border rounded-lg overflow-hidden bg-gray-100">
            <canvas ref={canvasRef} />
          </div>

          {/* Legenda */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#FF5722]"></div>
              <span>Pessoas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#4CAF50]"></div>
              <span>Lojas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFC107]"></div>
              <span>Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#E0E0E0]"></div>
              <span>Estacionamento</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pessoas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalPeople}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Circulando no momento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Velocidade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.averageSpeed.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unidades de velocidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Gargalos Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.bottlenecks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Áreas com alta densidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Gargalos */}
      {metrics.bottlenecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gargalos Identificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.bottlenecks.map((bottleneck, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{bottleneck.location}</div>
                    <div className="text-sm text-muted-foreground">
                      Densidade: {bottleneck.density} pessoas
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bottleneck.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : bottleneck.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {bottleneck.severity === 'high'
                      ? 'Alta'
                      : bottleneck.severity === 'medium'
                      ? 'Média'
                      : 'Baixa'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Considere ampliar corredores em áreas com alta densidade de pessoas
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Adicione mais pontos de entrada/saída para distribuir melhor o fluxo
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Posicione lojas âncora nas extremidades para incentivar circulação
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Evite gargalos próximos a entradas de lojas populares
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
