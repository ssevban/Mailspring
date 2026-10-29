import React from 'react';
import {
  localized,
  Actions,
  Thread,
  TaskFactory,
  FocusedPerspectiveStore,
} from 'mailspring-exports';

const sameThreadId = (prev: { thread: Thread }, next: { thread: Thread }) =>
  prev.thread.id === next.thread.id;

export const ThreadUnreadQuickAction: React.FC<{ thread: Thread }> = React.memo(
  ({ thread }) => {
    const label = localized(`Mark as %@`, thread.unread ? localized('Read') : localized('Unread'));

    const onToggleUnread = (event: React.MouseEvent | React.KeyboardEvent) => {
      Actions.queueTask(
        TaskFactory.taskForSettingUnread({
          threads: [thread],
          unread: !thread.unread,
          source: 'Quick Actions: Thread List',
        })
      );
      event.stopPropagation();
    };

    return (
      <div
        key="unread"
        role="button"
        tabIndex={0}
        title={label}
        aria-label={label}
        style={{ order: 100 }}
        className={`btn action ${thread.unread ? 'action-read' : 'action-unread'}`}
        onClick={onToggleUnread}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleUnread(e);
          }
        }}
      />
    );
  },
  (prev, next) => sameThreadId(prev, next) && prev.thread.unread === next.thread.unread
);
ThreadUnreadQuickAction.displayName = 'ThreadUnreadQuickAction';

export const ThreadTrashQuickAction: React.FC<{ thread: Thread }> = React.memo(({ thread }) => {
  const allowed = FocusedPerspectiveStore.current().canMoveThreadsTo([thread], 'trash');
  if (!allowed) {
    return <span />;
  }

  const onRemove = (event: React.MouseEvent | React.KeyboardEvent) => {
    const tasks = TaskFactory.tasksForMovingToTrash({
      source: 'Quick Actions: Thread List',
      threads: [thread],
    });
    Actions.queueTasks(tasks);
    event.stopPropagation();
  };

  return (
    <div
      key="remove"
      role="button"
      tabIndex={0}
      title={localized('Trash')}
      aria-label={localized('Trash')}
      style={{ order: 110 }}
      className="btn action action-trash"
      onClick={onRemove}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRemove(e);
        }
      }}
    />
  );
}, sameThreadId);
ThreadTrashQuickAction.displayName = 'ThreadTrashQuickAction';
