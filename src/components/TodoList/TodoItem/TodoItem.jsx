import { React, useState, useRef, useCallback } from 'react'
import classes from './TodoItem.module.css'
import { textVlidationIdInput, tooltipForDeleteBtn } from '../../../constants'
import { useDetectClickOutside } from 'react-detect-click-outside'

const TodoItem = (props) => {
    const {
        item,
        toggleHandler,
        id,
        onDelete,
        setDefultItem,
        onChangeTitle,
        setFocus,
        focus,
        changeStatusLock,
        selectImg,
        onChangeImg,
    } = props
    const refId = useRef(null)
    const refTitle = useRef(null)
    const [title, setTitle] = useState('')
    const [idInput, setIdInput] = useState('')
    const [titleStatus, setTitleStatus] = useState(false)
    const [changeImg, setChangeImg] = useState(false)
    const [opacityItem, setOpacityItem] = useState(false)

    const deleteFieldHandler = (event, id) => {
        event.preventDefault()

        onDelete(id)
    }

    const toggleHandlerCheckBox = (id) => {
        toggleHandler(id)
    }

    const changeHandlerId = (event) => {
        const checkValue = event.target.value.length > 3
        if (checkValue) {
            alert(textVlidationIdInput)
        }
        setIdInput(event.target.value)
    }

    const changeHandlerTitle = (event) => {
        setTitle(event.target.value)
    }

    const addId = useCallback(
        (event) => {
            if (event.key === 'Enter') {
                setDefultItem(prevState => {
                    return {
                        ...prevState,
                        id: refId.current.value
                    }
                })
                refTitle.current.focus()
            }
        },
        [setDefultItem],
    )


    const addTitle = useCallback(
        (event) => {
            if (event.key === 'Enter') {
                if (titleStatus) {
                    onChangeTitle(id, refTitle.current.value)
                    setTitleStatus(false)
                }

                setDefultItem && setDefultItem(prevState => {
                    return {
                        ...prevState,
                        title: refTitle.current.value
                    }
                })
            }
        },
        [id, onChangeTitle, setDefultItem, titleStatus],
    )


    const changeTitleStatus = useCallback(
        (e) => {
            e.stopPropagation()
            setTitle(item.title)

            if (!item.status) {
                setTitleStatus(true)
                setFocus(true)
                setChangeImg(true)
            }
        },
        [item.status, item.title, setFocus],
    )

    const onClickImgSelectBlock = (e) => e.stopPropagation()

    const ref = useDetectClickOutside({
        onTriggered: () => {
            setTitleStatus(false)
            setChangeImg(false)
        }
    })

    const imgHandler = (id, img, alt, idImg) => {
        if (item.img.id !== idImg) {
            onChangeImg(id, img, alt, idImg)
            setChangeImg(false)

            titleStatus ? refTitle.current.focus() : setTitleStatus(false)
        }
    }

    const showSelectImg = () => {
        return selectImg.map(el => {
            return <img
                className={item.img.id === el.id && classes.img__select__disabled}
                onClick={() => imgHandler(id, el.src, el.alt, el.id)}
                key={el.id}
                width={20}
                height={20}
                src={el.src}
                alt={el.alt}
            />
        })
    }

    const showInputIdOrHandlerId = () => {
        return !item.id ? <input
            className={classes.item__id__input}
            type="text"
            id="id"
            ref={refId}
            value={idInput}
            onChange={changeHandlerId}
            onKeyPress={addId}
            autoFocus={!focus ? true : false}
        /> : <div className={classes.item__id}>{item.id}</div>
    }

    const showTitleHandlerOrTitle = () => {
        return !item.title || titleStatus ? <input
        onClick={(e) => e.stopPropagation()}
            className={classes.item__title__input}
            type="text"
            id="id"
            ref={refTitle}
            value={title}
            onChange={changeHandlerTitle}
            onKeyPress={addTitle}
            autoFocus={focus}
        /> : <div className={classes.item__title__text}><span onClick={changeTitleStatus}>{item.title}</span></div>
    }

    const showDeleteButton = () => {
        return <div
            onMouseLeave={() => setOpacityItem(false)}
            onMouseEnter={() => setOpacityItem(true)}
            className={classes.item__delete}>
            {!item.default && <button
                title={tooltipForDeleteBtn}
                className={!item.default && classes.btn__delete}
                onClick={event => deleteFieldHandler(event, id)}>
                {!item.default ? 'X' : null}
            </button>}
        </div>
    }

    const showImgTitle = () => {
        return <div className={classes.item__title__img}>
            <img width={20} height={20} src={item.img.src} alt={item.img.alt} />
        </div>
    }

    const renderLableBox = () => {
        return <div className={classes.item__checkbox}>
            <input
                className={classes.highload}
                type="checkbox"
                id={id} name="highload"
                checked={item.status}
                onChange={() => toggleHandlerCheckBox(id)}
            />
            <label htmlFor={id} className={classes.lb1} />
        </div>
    }

    const renderTitleDescription = () => {
        return <div className={classes.item__title}>
            {showImgTitle()}
            {showTitleHandlerOrTitle()}
            {changeImg && <div ref={ref} onClick={onClickImgSelectBlock} className={classes.img__select}>
                {showSelectImg()}
            </div>
            }
        </div>
    }


    return (
        <section
            onClick={() => changeStatusLock(id)}
            className={`${item.statusLock ? classes.item__select : classes.item} ${opacityItem && classes.opacity__delete}`}
        >
            <div className={item.statusLock ? classes.item__separator : classes.item__separator__hover} />
            {renderLableBox()}
            {item.product && <div className={classes.item__product}>{item.product}</div>}
            {showInputIdOrHandlerId()}
            {renderTitleDescription()}
            {showDeleteButton()}
        </section>
    )
}

export default TodoItem