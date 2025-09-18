import React, { useMemo } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table/index';

type Component<P> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P>
  | React.FC<P>
  | keyof React.ReactHTML;
export type CustomizeComponent = Component<unknown>;

interface DraggableTableProps<T extends { id: string }> extends TableProps<T> {
  dataSource: T[];
  onUpdateListOrder: (itemId: string, destination: number, source: number) => void;
  children?: React.ReactElement[];
  wrapper?: CustomizeComponent;
  dndDisabled?: boolean;
  rowKey?: string;
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row = ({ children, ...props }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const expandable =
    props.className?.includes('ant-table-expanded-row') ||
    props.className?.includes('ant-table-placeholder');

  if (expandable) {
    return <tr {...props}>{children}</tr>;
  }

  const style: React.CSSProperties = expandable
    ? {}
    : {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
      };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if ((child as React.ReactElement).key === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <MenuOutlined
                ref={setActivatorNodeRef}
                style={{ touchAction: 'none', cursor: 'move' }}
                {...listeners}
              />
            ),
          });
        }

        return child;
      })}
    </tr>
  );
};

function DraggableTable<T extends { id: string }>({
  dataSource,
  onUpdateListOrder,
  children,
  wrapper,
  dndDisabled,
  ...props
}: DraggableTableProps<T>) {
  const items = useMemo(() => dataSource.map((item) => item.id), [dataSource]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
        distance: 4,
      },
    })
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over?.id) {
      const activeIndex = items.findIndex((id) => id === active.id);
      const overIndex = items.findIndex((id) => id === over?.id);
      onUpdateListOrder(active.id as string, overIndex, activeIndex);
    }
  };

  return (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <Table<T>
          pagination={false}
          components={{
            body: {
              row: Row,
            },
          }}
          dataSource={dataSource}
          {...props}
        >
          {children}
        </Table>
      </SortableContext>
    </DndContext>
  );
}

export default DraggableTable;
