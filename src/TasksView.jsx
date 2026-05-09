import React from 'react';
import { Check, Trash2, Plus, ListTodo } from 'lucide-react';

const TasksView = ({
  taskTab,
  setTaskTab,
  activeTasks,
  completedTasks,
  filteredActiveTasks,
  filteredCompletedTasks,
  newTaskInput,
  setNewTaskInput,
  handleAddTask,
  handleToggleTask,
  handleDeleteTask,
  editingTaskId,
  editTaskText,
  setEditTaskText,
  saveEditTask,
  startEditTask
}) => {
  return (
    <div className="w-full bg-white flex flex-col animate-fadeIn flex-1">
      {/* Tabs Header */}
      <div className="shrink-0 bg-slate-50/50 px-6 pt-2">
        <div className="max-w-4xl mx-auto flex items-end border-b border-slate-200">
          <button
            onClick={() => setTaskTab('active')}
            className={`py-3 px-3 font-semibold text-sm transition-colors relative ${taskTab === 'active' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tasks {activeTasks.length > 0 && `(${activeTasks.length})`}
            {taskTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setTaskTab('completed')}
            className={`py-3 px-3 font-semibold text-sm transition-colors relative ${taskTab === 'completed' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Completed {completedTasks.length > 0 && `(${completedTasks.length})`}
            {taskTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        </div>
      </div>

      {/* Add Task Input (Sticky) */}
      {taskTab === 'active' && (
        <div className="px-6 pt-2 mt-2 pb-2 bg-white shrink-0 z-10">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a task..."
              className="w-full pl-5 pr-14 px-4 py-3 bg-blue-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
            <button
              onClick={handleAddTask}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Tasks Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 hide-scrollbar">
        <div className="max-w-4xl mx-auto space-y-2">
          {(taskTab === 'active' ? filteredActiveTasks : filteredCompletedTasks).map(task => (
            <div key={task.id} className="group flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all animate-fadeIn">
              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`group/tick shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-300 hover:border-blue-400'}`}
                >
                  {task.completed ? (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  ) : (
                    <Check size={14} className="text-blue-400 opacity-0 group-hover/tick:opacity-50 transition-opacity" strokeWidth={3} />
                  )}
                </button>

                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    value={editTaskText}
                    onChange={(e) => setEditTaskText(e.target.value)}
                    onBlur={saveEditTask}
                    onKeyDown={(e) => e.key === 'Enter' && saveEditTask()}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-sm font-medium text-slate-800 rounded-lg outline-none border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-full"
                    autoFocus
                  />
                ) : (
                  <div
                    onDoubleClick={() => !task.completed && startEditTask(task)}
                    className={`flex-1 text-sm font-medium truncate py-1 ${task.completed ? 'text-slate-400 line-through cursor-default' : 'text-slate-700 cursor-text'}`}
                  >
                    {task.text}
                  </div>
                )}
              </div>

              {/* Delete Action */}
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Delete Task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {(taskTab === 'active' ? activeTasks : completedTasks).length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <ListTodo size={32} />
              </div>
              {taskTab === 'active' ? "No active tasks. Add one above!" : "No completed tasks yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksView;
