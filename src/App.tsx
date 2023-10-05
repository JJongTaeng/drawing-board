import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { DrawingBoard } from './service/DrawingBoard';

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
      <div ref={parent} className="App"></div>
    </>
  );
}

export default App;
