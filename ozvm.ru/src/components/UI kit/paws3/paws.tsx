'use client'
import { useEffect, useRef } from 'react';
import img from '../../../../img/secondpaws.png'
import Image from 'next/image';
import styles from "./paws.module.css"

const StepAnimation = ({ steps }) => {
    const ref = useRef(null);

    // Функция для запуска анимации
    const startAnimation = () => {
        if (!ref.current) return;

        const element = ref.current;
        let currentStep = 0;

        const animate = () => {
            if (currentStep >= steps.length) {
                currentStep = 0;
            }

            element.style.transform = `translateY(${steps[currentStep]}vh)`;
            setTimeout(() => {
                currentStep++;
                requestAnimationFrame(animate);
            }, 2000); // Задержка между шагами
        };

        setTimeout(() => {
            animate();
        }, 1300); // Задерживаем старт анимации на указанное количество миллисекунд
    };


    useEffect(() => {
        startAnimation(); // Запускаем анимацию при монтировании компонента
    }, []);


    return (
        <div style={{ position: 'relative', height: '100%', width: '200px', top: '0', pointerEvents: 'none' }}>
            <Image
                ref={ref}
                src={img} // Укажите путь до вашего PNG-файла
                alt="Animal paw"
                className={styles.fadeInOut}
                style={{
                    width: '300px', // Размер лапки
                    height: 'auto',
                    transformOrigin: 'bottom center', // Центр вращения внизу
                    position: 'absolute', // Позволяет позиционировать относительно родителя
                    bottom: '0',
                    left: '55vw',
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
};

export default function Paw3() {
    const steps = Array.from({ length: 10 }, (_, i) => -(i * 15)); // Меньшие шаги анимации

    return (
        <div style={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', top: '0', pointerEvents: 'none' }}>
            <StepAnimation steps={steps} />
        </div>
    );
}