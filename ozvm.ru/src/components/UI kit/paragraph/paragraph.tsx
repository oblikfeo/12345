import styles from "./paragraph.module.css"
import Link from "next/link"

export default function Paragraph({ text, props, clickable, onClick, linkType, linkValue }: { text?: string; props?: string | number; clickable?: boolean; onClick?: () => void; linkType?: string; linkValue?: string }) {
    // Определяем URL для ссылки
    const getLinkUrl = () => {
        if (linkType === 'category' && linkValue) {
            return `/catalog?slug=${encodeURIComponent(linkValue)}`;
        }
        if (linkType === 'manufacturer' || (!linkType && clickable)) {
            return `/catalog?manufacturer=${encodeURIComponent(String(props))}`;
        }
        return null;
    };

    const linkUrl = getLinkUrl();

    // Если text пустой, не показываем заголовок и border
    if (!text) {
        return (
            <div className={styles.paragraph}>
                <div className={styles.hidden}>
                    {clickable && props ? (
                        onClick ? (
                            <span onClick={onClick} className={styles.clickable}>
                                <h3 className={styles.hidden}>{props}</h3>
                            </span>
                        ) : linkUrl ? (
                            <Link href={linkUrl} className={styles.clickable}>
                                <h3 className={styles.hidden}>{props}</h3>
                            </Link>
                        ) : (
                            <h3 className={styles.hidden}>{props ? props : ""}</h3>
                        )
                    ) : (
                        <h3 className={styles.hidden}>{props ? props : ""}</h3>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.paragraph}>
            <h2>{text}</h2>
            <div className={styles.border}>
                <div className={styles.borderItem}></div>
            </div>
            <div className={styles.hidden}>
                {clickable && props ? (
                    onClick ? (
                        <span onClick={onClick} className={styles.clickable}>
                            <h3 className={styles.hidden}>{props}</h3>
                        </span>
                    ) : linkUrl ? (
                        <Link href={linkUrl} className={styles.clickable}>
                            <h3 className={styles.hidden}>{props}</h3>
                        </Link>
                    ) : (
                        <h3 className={styles.hidden}>{props ? props : ""}</h3>
                    )
                ) : (
                    <h3 className={styles.hidden}>{props ? props : ""}</h3>
                )}
            </div>
        </div>
    )
}