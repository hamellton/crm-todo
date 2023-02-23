import { React, useState, useEffect } from "react"
import TodoList from "./components/TodoList/TodoList"
import { ITEM, TODO_LIST, selectImages } from './constants'
import classes from './App.module.css'

const App = () => {
  const [todo, setTodo] = useState(TODO_LIST)
  const [defaultItem, setDefultItem] = useState(null)
  const [focus, setFocus] = useState(false)
  const [isLockedFields, setIsLockedFields] = useState(false)
  const [selectImg, setSelectImages] = useState()

  useEffect(() => {
    setSelectImages(selectImages)
  }, [todo])
  

  const buttonAddItem = () => {
    setDefultItem({...ITEM, img: {...selectImages[0]}})
  }

  useEffect(() => {
    if (defaultItem && defaultItem.id && defaultItem.title) {
      defaultItem.default = false
      setTodo([defaultItem, ...todo])
      setDefultItem(null)
    }
  }, [defaultItem, todo])


  const toggleHandler = (id) => {
    setTodo(prevState => {
      return prevState.map(el => {
        if (el.id === id) {
          return {
            ...el,
            status: !el.status,
          }
        }
        return el
      })
    })
  }

  const onDelete = (id) => {
    setTodo(prevState => prevState.filter(todo => todo.id !== id))
  }

  const onDeleteSelected = () => {
    setTodo(prevState => prevState.filter(todo => Boolean(!todo.statusLock)))
  }

  const onChangeTitle = (id, newTitle) => {
    setTodo(prevState => {
      return prevState.map(el => {
        if (el.id === id) {
          return {
            ...el,
            title: newTitle,
          }
        }
        return el
      })
    })
  }

  const onChangeImg = (id, img, alt, idImg) => {
    setTodo(prevState => {
      return prevState.map(el => {
        if (el.id === id) {
          return {
            ...el,
            img: {
              src: img,
              alt: alt,
              id: idImg,
            },
          }
        }
        return el
      })
    })
  }

  useEffect(() => {
    const islockedTodos = todo.filter(todo => Boolean(todo.statusLock))
    if (islockedTodos.length > 0) {
      setIsLockedFields(true)
    } else {
      setIsLockedFields(false)
    }
  }, [todo])
  

  const changeStatusLock = (id) => {
    setTodo(prevState => {
      return prevState.map(el => {
        if (el.id === id) {
          return {
            ...el,
            statusLock: !el.statusLock,
          }
        }
        return el
      })
    })
  }

  return (
    <div className={classes.todo}>
      <div className={classes.container}>
        <div className={classes.todo__container}>
          <TodoList
            todo={todo}
            setTodo={setTodo}
            toggleHandler={toggleHandler}
            onDelete={onDelete}
            defaultItem={defaultItem}
            setDefultItem={setDefultItem}
            onChangeTitle={onChangeTitle}
            setFocus={setFocus}
            focus={focus}
            changeStatusLock={changeStatusLock}
            selectImg={selectImg}
            onChangeImg={onChangeImg}
          />
          <div className={classes.handle__buttons}>
            <button className={classes.btn__add__item} onClick={buttonAddItem}>+</button>
            {isLockedFields && <button className={classes.btn__add__item} onClick={onDeleteSelected}>X</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
