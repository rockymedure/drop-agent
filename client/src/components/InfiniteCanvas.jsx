import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasCard } from './CanvasCard';
import { CanvasAgent } from './CanvasAgent';

const InfiniteCanvas = ({ cards, onCardUpdate, onCardDelete, onCardAdd }) => {
  const canvasRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedCard, setSelectedCard] = useState(null);
  const [isDropZone, setIsDropZone] = useState(false);
  
  // Canvas drag and pan functionality
  const handleMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * scaleFactor, 0.1), 3);
    
    setTransform(prev => ({
      x: prev.x - (mouseX - prev.x) * (newScale / prev.scale - 1),
      y: prev.y - (mouseY - prev.y) * (newScale / prev.scale - 1),
      scale: newScale
    }));
  }, [transform.scale]);

  // Drop zone handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDropZone(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!canvasRef.current?.contains(e.relatedTarget)) {
      setIsDropZone(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDropZone(false);
    
    const messageData = e.dataTransfer.getData('text/plain');
    if (messageData) {
      try {
        const message = JSON.parse(messageData);
        const rect = canvasRef.current.getBoundingClientRect();
        const canvasX = (e.clientX - rect.left - transform.x) / transform.scale;
        const canvasY = (e.clientY - rect.top - transform.y) / transform.scale;
        
        const newCard = {
          id: `card-${Date.now()}`,
          x: canvasX,
          y: canvasY,
          width: 300,
          height: 200,
          content: message.content,
          type: message.role,
          originalMessage: message,
          summary: null,
          concepts: []
        };
        
        onCardAdd(newCard);
      } catch (error) {
        console.error('Error parsing dropped message:', error);
      }
    }
  }, [transform, onCardAdd]);

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('dragleave', handleDragLeave);
    canvas.addEventListener('drop', handleDrop);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('dragleave', handleDragLeave);
      canvas.removeEventListener('drop', handleDrop);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleDragOver, handleDragLeave, handleDrop]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX, screenY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - transform.x) / transform.scale,
      y: (screenY - rect.top - transform.y) / transform.scale
    };
  }, [transform]);

  // Reset canvas view
  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  // Zoom to fit all cards
  const zoomToFit = useCallback(() => {
    if (cards.length === 0) return;
    
    const padding = 50;
    const minX = Math.min(...cards.map(card => card.x)) - padding;
    const minY = Math.min(...cards.map(card => card.y)) - padding;
    const maxX = Math.max(...cards.map(card => card.x + card.width)) + padding;
    const maxY = Math.max(...cards.map(card => card.y + card.height)) + padding;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRect.width / (maxX - minX);
    const scaleY = canvasRect.height / (maxY - minY);
    const scale = Math.min(scaleX, scaleY, 1);
    
    setTransform({
      x: (canvasRect.width - (maxX - minX) * scale) / 2 - minX * scale,
      y: (canvasRect.height - (maxY - minY) * scale) / 2 - minY * scale,
      scale
    });
  }, [cards]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      {/* Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <button
          onClick={resetView}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium"
        >
          Reset View
        </button>
        <button
          onClick={zoomToFit}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium"
        >
          Zoom to Fit
        </button>
        <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm text-gray-600">
          Zoom: {Math.round(transform.scale * 100)}%
        </div>
      </div>

      {/* Canvas Agent */}
      <CanvasAgent cards={cards} onCardUpdate={onCardUpdate} />

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className={`w-full h-full cursor-grab select-none transition-colors ${
          isDragging ? 'cursor-grabbing' : ''
        } ${isDropZone ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Drop Zone Indicator */}
        {isDropZone && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-blue-500 text-xl font-medium bg-white px-4 py-2 rounded-lg shadow-lg">
              Drop message here to create a card
            </div>
          </div>
        )}

        {/* Cards */}
        {cards.map((card) => (
          <CanvasCard
            key={card.id}
            card={card}
            selected={selectedCard === card.id}
            onSelect={() => setSelectedCard(card.id)}
            onUpdate={(updates) => onCardUpdate(card.id, updates)}
            onDelete={() => onCardDelete(card.id)}
            scale={transform.scale}
          />
        ))}
      </div>
    </div>
  );
};

export default InfiniteCanvas;