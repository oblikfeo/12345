'use client'
import { useState } from "react"
import styles from "./delivery.module.css"

export default function Delivery({ setModalChange, name, phone, setEntrance, setFloor, setApartment, setComment, setWhere, setAdress, address, show, setShow }) {

    const [pick, setPick] = useState(true)

    const [initialAddress] = useState(address)

    return (
        <div className={styles.wrapper}>
            <h1>Доставка</h1>
            <div className={styles.way}>
                <div onClick={() => {
                    setPick(true)
                    setWhere("Доставка")
                }} className={pick ? styles.pick : styles.ways}>Доставка</div>
                <div onClick={() => {
                    setPick(false)
                    setWhere("Самовывоз")
                }} className={pick ? styles.ways : styles.pick}>Самовывоз</div>
            </div>
            {pick && <div className={styles.mainFlex}>
                <div onClick={() => {
                    setAdress(initialAddress)
                    setShow(true)
                }} className={styles.flex}>
                    {!show ? whitePick : redPick}
                    <div>{initialAddress}</div>
                </div>
                <div onClick={() => {
                    setAdress("")
                    setShow(false)
                }} className={styles.flex}>
                    {show ? whitePick : redPick}
                    <div>Другой адрес</div>
                </div>
            </div>}
            {!show && pick && <div className={styles.position}>
                <div className={styles.geoImg}>{geo}</div>
                <input onChange={(e) => setAdress(e.target.value)} className={address.length == 0 ? styles.writeAdressRed : styles.writeAdress} type="text" placeholder="Адрес (город, улица, номер дома)" />
            </div>}
            {pick && !show && <div className={styles.details}>
                <div className={styles.upInputs}>
                    <div>
                        <div className={styles.adress}>Подъезд</div>
                        <input onChange={(e) => setEntrance(e.target.value)} className={styles.input} type="text" />
                    </div>
                    <div>
                        <div className={styles.adress}>Этаж</div>
                        <input onChange={(e) => setFloor(e.target.value)} className={styles.input} type="text" />
                    </div>
                    <div>
                        <div className={styles.adress}>Квартира</div>
                        <input onChange={(e) => setApartment(e.target.value)} className={styles.input} type="text" />
                    </div>
                </div>
            </div>}
            {pick && <div>
                <input onChange={(e) => setComment(e.target.value)} className={styles.inputBig} type="text" placeholder="Комментарий курьеру" />
            </div>}
            {!pick && <div>
                <div>Ваш заказ будет готов в течении дня.</div>
                <div>Статус заказа можно отследить в личном кабинете.</div>
            </div>}
            <div className={styles.who}>
                <h1>Получатель</h1>
                <div>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.number}>{phone}</div>
                </div>
                <div onClick={() => setModalChange(true)} className={styles.change}>Изменить</div>
            </div>
        </div>
    )
}

const redPick = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10 5C7.2 5 5 7.2 5 10C5 12.8 7.2 15 10 15C12.8 15 15 12.8 15 10C15 7.2 12.8 5 10 5ZM10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 18C5.6 18 2 14.4 2 10C2 5.6 5.6 2 10 2C14.4 2 18 5.6 18 10C18 14.4 14.4 18 10 18Z" fill="#C51A1A" />
</svg>

const whitePick = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM10 18C5.6 18 2 14.4 2 10C2 5.6 5.6 2 10 2C14.4 2 18 5.6 18 10C18 14.4 14.4 18 10 18Z" fill="#5677A9" />
</svg>;

const geo = <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.4" d="M7.35849 0C3.30075 0 0 3.35547 0 7.48047C0 8.82422 0.622494 10.5195 1.89822 12.6641C2.95877 14.4453 4.27292 16.2148 5.42953 17.7734C5.96364 18.4922 6.46702 19.1719 6.85512 19.7344C6.97039 19.9023 7.15868 20 7.35849 20C7.5583 20 7.74659 19.9023 7.86187 19.7344C8.24996 19.1719 8.75334 18.4922 9.28745 17.7734C10.4441 16.2148 11.7544 14.4453 12.8188 12.6641C14.0945 10.5195 14.717 8.82422 14.717 7.48047C14.717 3.35547 11.4162 0 7.35849 0ZM7.35849 10.9375C5.48332 10.9375 3.95783 9.38672 3.95783 7.48047C3.95783 5.57422 5.48332 4.02344 7.35849 4.02344C9.23366 4.02344 10.7592 5.57422 10.7592 7.48047C10.7592 9.38672 9.23366 10.9375 7.35849 10.9375Z" fill="#264794" />
</svg>
