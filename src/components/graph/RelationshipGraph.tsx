import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { GraphNodeId } from "../../domain/types";
import {
  getNeighborNodeIds,
  makeGraphNodeId,
  type RelationshipGraphLink,
  type RelationshipGraphModel,
  type RelationshipGraphNode
} from "../../domain/graphModel";
import { useAppStore } from "../../store/useAppStore";

interface RelationshipGraphProps {
  graph: RelationshipGraphModel;
}

type ForceGraphHandle = {
  centerAt: (x?: number, y?: number, ms?: number) => void;
  zoom: (scale?: number, ms?: number) => void;
  d3Force: (name: string, force?: unknown) => unknown;
};

type RenderLink = RelationshipGraphLink & {
  source: GraphNodeId | RelationshipGraphNode;
  target: GraphNodeId | RelationshipGraphNode;
};

function endpointId(endpoint: GraphNodeId | RelationshipGraphNode) {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function RelationshipGraph({ graph }: RelationshipGraphProps) {
  const selectedNode = useAppStore((state) => state.selectedNode);
  const selectNode = useAppStore((state) => state.selectNode);
  const graphRef = useRef<ForceGraphHandle>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 900, height: 700 });

  const selectedGraphNodeId = selectedNode ? makeGraphNodeId(selectedNode.type, selectedNode.id) : null;
  const neighborNodeIds = useMemo(() => getNeighborNodeIds(graph, selectedGraphNodeId), [graph, selectedGraphNodeId]);
  const focusNodeIds = useMemo(() => {
    const ids = new Set(neighborNodeIds);
    if (selectedGraphNodeId) {
      ids.add(selectedGraphNodeId);
    }
    return ids;
  }, [neighborNodeIds, selectedGraphNodeId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(320, entry.contentRect.width),
        height: Math.max(360, entry.contentRect.height)
      });
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const charge = graphRef.current?.d3Force("charge") as { strength?: (value: number) => void } | undefined;
    charge?.strength?.(-150);
  }, []);

  useEffect(() => {
    if (!selectedGraphNodeId || !graphRef.current) {
      return;
    }

    const selectedGraphNode = graph.nodes.find((node) => node.id === selectedGraphNodeId);
    if (selectedGraphNode?.x !== undefined && selectedGraphNode?.y !== undefined) {
      graphRef.current.centerAt(selectedGraphNode.x, selectedGraphNode.y, 700);
      graphRef.current.zoom(2.1, 700);
    }
  }, [graph.nodes, selectedGraphNodeId]);

  function isFocusedNode(nodeId: GraphNodeId) {
    return !selectedGraphNodeId || focusNodeIds.has(nodeId);
  }

  function isFocusedLink(link: RenderLink) {
    if (!selectedGraphNodeId) {
      return true;
    }

    return endpointId(link.source) === selectedGraphNodeId || endpointId(link.target) === selectedGraphNodeId;
  }

  return (
    <div className="relative h-full min-h-0" ref={containerRef}>
      {graph.nodes.length === 0 ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-50/80">
          <div className="max-w-sm text-center">
            <p className="text-lg font-semibold text-slate-900">No graph matches</p>
            <p className="mt-2 text-sm text-slate-500">Clear the search or choose a broader CDI context.</p>
          </div>
        </div>
      ) : null}
      <ForceGraph2D
        ref={graphRef as never}
        backgroundColor="#f8fafc"
        cooldownTicks={120}
        graphData={graph}
        height={size.height}
        linkColor={(link) => (isFocusedLink(link as RenderLink) ? "rgba(71, 85, 105, 0.58)" : "rgba(148, 163, 184, 0.15)")}
        linkDirectionalParticles={(link) => (isFocusedLink(link as RenderLink) ? 1 : 0)}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={1.6}
        linkWidth={(link) => (isFocusedLink(link as RenderLink) ? 1.7 : 0.6)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const graphNode = node as RelationshipGraphNode;
          const focused = isFocusedNode(graphNode.id);
          const selected = graphNode.id === selectedGraphNodeId;
          const radius = Math.max(4, graphNode.val);
          const opacity = focused ? 1 : 0.18;
          const label = graphNode.label;
          const fontSize = Math.max(3.2, 12 / globalScale);

          ctx.save();
          ctx.font = `${selected ? 700 : 600} ${fontSize}px Inter, system-ui, sans-serif`;
          const labelWidth = ctx.measureText(label).width + 12;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.arc(graphNode.x ?? 0, graphNode.y ?? 0, radius + (selected ? 3 : 0), 0, 2 * Math.PI, false);
          ctx.fillStyle = selected ? "#0f172a" : graphNode.color;
          ctx.fill();
          ctx.lineWidth = selected ? 2.2 : 1;
          ctx.strokeStyle = selected ? "#f8fafc" : "rgba(255,255,255,0.82)";
          ctx.stroke();

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          roundRect(
            ctx,
            (graphNode.x ?? 0) - labelWidth / 2,
            (graphNode.y ?? 0) + radius + 4,
            labelWidth,
            fontSize + 7,
            5 / globalScale
          );
          ctx.fillStyle = focused ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.74)";
          ctx.fill();
          ctx.fillStyle = focused ? "#0f172a" : "#64748b";
          ctx.fillText(label, graphNode.x ?? 0, (graphNode.y ?? 0) + radius + 4 + (fontSize + 7) / 2);
          ctx.restore();
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          const graphNode = node as RelationshipGraphNode;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(graphNode.x ?? 0, graphNode.y ?? 0, Math.max(12, graphNode.val + 8), 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onBackgroundClick={() => selectNode(null)}
        onNodeClick={(node) => {
          const graphNode = node as RelationshipGraphNode;
          selectNode({ type: graphNode.type, id: graphNode.rawId });
        }}
        width={size.width}
      />
    </div>
  );
}
