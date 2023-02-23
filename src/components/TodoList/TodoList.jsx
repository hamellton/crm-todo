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

  const renderTodoList = () => {
    return todo.map((el) =>
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

  const renderDefaultItem = () => {
    return defaultItem && <TodoItem
      item={defaultItem}
      toggleHandler={toggleHandler}
      setDefultItem={setDefultItem}
      setFocus={setFocus}
      focus={focus}
    />
  }

  return (
    <section className={classes.todo}>
      {renderDefaultItem()}
      {renderTodoList()}
    </section>
  )
}

export default TodoList