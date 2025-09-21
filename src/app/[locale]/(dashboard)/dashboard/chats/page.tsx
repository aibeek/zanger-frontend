import { Chat } from '@/widgets/Chat';
import { RightWidgets } from '../components/RightWidgets';
import s from './page.module.scss';

export default function ChatsPage() {
  return (
    <div className={s.chatContent}>
      <div className={s.chatArea}>
        <Chat />
      </div>
      <RightWidgets />
    </div>
  );
}