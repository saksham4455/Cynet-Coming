import IntroSequence from './components/IntroSequence';
import './App.css';

function App() {
  return (
    <div className="w-full min-h-screen">
      <IntroSequence onComplete={() => {
        // Intro sequence completes and stays on final screen
        console.log('CYNET intro sequence complete');
      }} />
    </div>
  );
}

export default App;


