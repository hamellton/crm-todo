import { React } from 'react'
import TodoItem from './TodoItem/TodoItem'
import classes from './TodoList.module.css'

const TodoList = (props) => {
  const {
    todo,
    toggleHandler,
    onDelete,
    defaultItem,
    setDefultItem,
    onChangeTitle,
    setFocus,
    focus,
    changeStatusLock,
    selectImg,
    onChangeImg,
  } = props
  return (
    <div className={classes.todo}>
      {defaultItem && <TodoItem
        item={defaultItem}
        toggleHandler={toggleHandler}
        setDefultItem={setDefultItem}
        setFocus={setFocus}
        focus={focus}
      />}
      {todo.map((el) =>
        <TodoItem
          key={el.id}
          id={el.id}
          item={el}
          toggleHandler={toggleHandler}
          onDelete={onDelete}
          onChangeTitle={onChangeTitle}
          setFocus={setFocus}
          focus={focus}
          changeStatusLock={changeStatusLock}
          selectImg={selectImg}
          onChangeImg={onChangeImg}
        />)
      }
    </div>
  )
}

export default TodoList