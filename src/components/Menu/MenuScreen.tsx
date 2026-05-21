import { useState } from 'react';
import { useGame } from '../../store/useGame';
import styles from './MenuScreen.module.css';

export function MenuScreen() {
  const { state, dispatch } = useGame();
  const [showTutorial, setShowTutorial] = useState(!state.tutorialSeen);

  function startGame() {
    dispatch({ type: 'START_PLACEMENT' });
  }

  function openTutorial() {
    setShowTutorial(true);
  }

  function closeTutorial() {
    setShowTutorial(false);
    dispatch({ type: 'DISMISS_TUTORIAL' });
  }

  return (
    <div className={styles.screen}>
      <div className={styles.parchment}>
        <span className={styles.eyeIcon}>𓂀</span>
        <h1 className={styles.title}>Пески Забвения</h1>
        <p className={styles.titleSub}>Тактика раскопок древней цивилизации</p>

        <div className={styles.divider} />

        <div className={styles.buttons}>
          <button className={styles.btnPrimary} onClick={startGame} type="button">
            Начать экспедицию
          </button>
          <button className={styles.btnSecondary} onClick={openTutorial} type="button">
            Правила
          </button>
        </div>

        <p className={styles.flavor}>
          «Под каждым слоем песка — история.<br />
          Под каждой историей — тайна.»
        </p>
      </div>

      {showTutorial && (
        <div className={styles.tutorialOverlay} onClick={closeTutorial}>
          <div className={styles.tutorialCard} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.tutorialTitle}>📜 Руководство экспедитора</h2>

            <div className={styles.tutorialSection}>
              <p className={styles.tutorialSectionTitle}>🎯 Цель</p>
              <p className={styles.tutorialText}>
                Раскопайте все ископаемые противника раньше, чем он раскопает ваши.
                Нажимайте на клетки поля противника, чтобы вести раскопки.
              </p>
            </div>

            <div className={styles.tutorialSection}>
              <p className={styles.tutorialSectionTitle}>🦕 Ископаемые</p>
              <p className={styles.tutorialText}>
                Каждый игрок скрывает 10 ископаемых: 1 плезиозавр (4 клетки),
                2 древних рыбы (3), 3 аммонита (2), 4 зуба мегалодона (1).
                Когда ископаемое полностью раскопано — оно засветится бронзовым.
              </p>
            </div>

            <div className={styles.tutorialSection}>
              <p className={styles.tutorialSectionTitle}>📜 Перемещение (новая механика!)</p>
              <p className={styles.tutorialText}>
                3 раза за игру вы можете переместить своё ископаемое на 1 клетку
                вместо раскопки. Переключитесь в режим «Переместить»,
                выберите ископаемое на своём поле, затем нажмите стрелку направления.
              </p>
            </div>

            <div className={styles.tutorialSection}>
              <p className={styles.tutorialSectionTitle}>⚠️ Ограничения перемещения</p>
              <p className={styles.tutorialText}>
                Нельзя выходить за границы поля, пересекаться с другими ископаемыми
                и перемещать уже полностью раскопанное ископаемое.
                Перемещение считается ходом — после него ходит противник.
              </p>
            </div>

            <button className={styles.tutorialClose} onClick={closeTutorial} type="button">
              Понятно, начинаем!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
