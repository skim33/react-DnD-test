import React, { useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "./App.css";

const tasks = [
  {id: 1, name: 'Item 1'},
  {id: 2, name: 'Item 2'},
  {id: 3, name: 'Item 3'},
  {id: 4, name: 'Item 4'},
];

const MovableItem = ({ name, index, moveImgHandler }) => {
  const dragRef = useRef(null);
  const previewRef = useRef(null);

  const [, drop] = useDrop({
    accept: "swipeImg",
    hover(item, monitor) {
      if (!previewRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = previewRef.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveImgHandler(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag, preview] = useDrag({
    index,
    name,
    type: "swipeImg" ,
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        console.log(dropResult);
        console.log(name);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0.4 : 1;

  drag(dragRef);
  drop(preview(previewRef));

  return (
    <div ref={previewRef} className="movable-item" style={{ opacity }}>
      <div
        ref={dragRef}
        style={{
          backgroundColor: "red",
          width: "1rem",
          height: "1rem",
          display: "inline-block",
          marginRight: "0.75rem",
          cursor: "move"
        }}
      />
      {name}
    </div>
  );
};

const Column = ({ children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: "swiperImg"
    // drop: () => ({}),
    // collect: (monitor) => ({
    //   isOver: monitor.isOver()
    // })
  });

  // const getBackgroundColor = () => {
  //   if (isOver) {
  //     return "rgb(188,251,255)";
  //   }
  // };

  return (
    <div
      ref={drop}
      className="column"
      // style={{ backgroundColor: getBackgroundColor() }}
    >
      {children}
    </div>
  );
};

export default function App() {
  const [items, setItems] = useState(tasks);

  const moveImgHandler = (dragIndex, hoverIndex) => {
    const dragItem = items[dragIndex];

    if (dragItem) {
      setItems((prevState) => {
        const coppiedStateArray = [...prevState];

        // remove item by "hoverIndex" and put "dragItem" instead
        const prevItem = coppiedStateArray.splice(hoverIndex, 1, dragItem);

        // remove item by "dragIndex" and put "prevItem" instead
        coppiedStateArray.splice(dragIndex, 1, prevItem[0]);

        return coppiedStateArray;
      });
    }
  };

  return (
    <div className="container">
      <DndProvider backend={HTML5Backend}>
        <Column>
          {items.map((item, index) => (
            <MovableItem
              key={item.id}
              name={item.name}
              index={index}
              moveImgHandler={moveImgHandler}
            />
          ))}
        </Column>
      </DndProvider>
    </div>
  );
};