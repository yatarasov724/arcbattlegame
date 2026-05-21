import { GameProvider } from './store/GameContext';
import { useGame } from './store/useGame';
import { MenuScreen } from './components/Menu/MenuScreen';
import { PlacementScreen } from './components/Placement/PlacementScreen';
import { BattleScreen } from './components/Battle/BattleScreen';
import { GameOverScreen } from './components/GameOver/GameOverScreen';
import './styles/variables.css';
import './styles/animations.css';
import styles from './App.module.css';

function GameRouter() {
  const { state } = useGame();

  switch (state.phase) {
    case 'menu':
      return <MenuScreen />;
    case 'placement':
      return <PlacementScreen />;
    case 'battle':
      return <BattleScreen />;
    case 'gameover':
      return <GameOverScreen />;
    default:
      return <MenuScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <div className={styles.app}>
        <GameRouter />
      </div>
    </GameProvider>
  );
}
