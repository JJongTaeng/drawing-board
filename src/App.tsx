import React, { useEffect, useRef } from 'react';
import './App.css';
import { DrawingBoard } from './service/DrawingBoard';
import { Color } from './types/drawing';

function App() {
  const parent = useRef<HTMLDivElement>(null);
  const drawingBoard = useRef<DrawingBoard>();

  useEffect(() => {
    drawingBoard.current = new DrawingBoard(parent.current as HTMLDivElement);
    return () => {
      drawingBoard.current?.unmount();
    };
  }, []);

  return (
    <>
      <button onClick={() => drawingBoard.current?.prev()}>prev</button>
      <button onClick={() => drawingBoard.current?.next()}>next</button>
      <button onClick={() => drawingBoard.current?.clear()}>clear</button>
      <button onClick={() => drawingBoard.current?.changeColor(Color.RED)}>
        RED
      </button>
      <button onClick={() => drawingBoard.current?.changeColor(Color.BLUE)}>
        BLUE
      </button>
      <div ref={parent} className="App"></div>
    </>
  );
}

export default App;
