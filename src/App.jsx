import { React, useState, useEffect, useRef, useCallback } from "react"
import TodoList from "./components/TodoList/TodoList"
import { ITEM, TODO_LIST, selectImages, selectNameLabel } from './constants'
import classes from './App.module.css'

const App = () => {
  const [todo, setTodo] = useState(TODO_LIST)
  const [defaultItem, setDefultItem] = useState(null)
  const [focus, setFocus] = useState(false)
  const [isLockedFields, setIsLockedFields] = useState(false)
  const [selectImg, setSelectImages] = useState(null)
  const [selectNames, setSelectNames] = useState(null)
  const [nameValue, setNameValue] = useState([])
  const refName = useRef(null)
  const [showDropdownInput, setShowDropdownInput] = useState(false)
  const [showSelectName, setShowSelectName] = useState(false)

  useEffect(() => {
    const names = todo.map((el) => {
      return {
        title: el.title,
        id: el.id
      }
    })
    setSelectImages(selectImages)
    setSelectNames(names)
  }, [todo])


  const buttonAddItem = () => {
    setDefultItem({ ...ITEM, img: { ...selectImages[0] } })
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

  const renderTodoList = () => {
    return <TodoList
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

  const renderCommonButtons = () => {
    return <div className={classes.handle__buttons}>
      <button className={classes.btn__add__item} onClick={buttonAddItem}>+</button>
      {isLockedFields && <button className={classes.btn__add__item} onClick={onDeleteSelected}>X</button>}
    </div>
  }

  const renderMainContent = () => {
    return <div className={classes.todo__container}>
      {renderTodoList()}
      {renderCommonButtons()}
    </div>
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

  const onChangeNameValue = (e) => {
    setNameValue(e.target.value)
  }


  const shouldShowNameSection = () => {
    setShowDropdownInput(true)
    setShowSelectName(true)
  }

  const onClickSelectname = useCallback(
    (id, title) => {
      setNameValue([...nameValue, title])
      const name = selectNames.filter((el) => el.id !== id)
      setSelectNames(name)
    },
    [nameValue, selectNames],
  )

  const showDropdownDetailes = () => {
    return <div
      className={classes.name__select}
      onMouseLeave={() => setShowDropdownInput(false)}
      onMouseEnter={shouldShowNameSection}
    >
      <label
        className={classes.dropdown__label}
        htmlFor="name">
        {selectNameLabel}
      </label>
      {showDropdownInput && <input
        className={classes.name__input}
        type="text"
        id="name"
        ref={refName}
        value={nameValue}
        onChange={onChangeNameValue}
        autoFocus={!focus ? true : false}
      />}
      {(showDropdownInput
        && showSelectName
        && (selectNames
        && selectNames.length > 0))
        && <div onMouseLeave={() => setShowSelectName(false)} className={classes.dropdown}>
          <ul>
            {(selectNames && selectNames.length > 0) && selectNames.map((el) => {
              return <li onClick={() => onClickSelectname(el.id, el.title)} key={el.id}>{el.title}</li>
            })}
          </ul>
        </div>}
    </div>
  }



  return (
    <div className={classes.todo}>
      <div className={classes.container}>
        {showDropdownDetailes()}
        {renderMainContent()}
      </div>
    </div>
  )
}

export default App
