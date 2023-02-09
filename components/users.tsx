import { User } from '@/lib/types';
import styles from '@/styles/users.module.css';

const Users = ({ users }: { users: User[] }) => {
  return (
    <div className={styles.usersOnline}>
      currently online: {users.length}
    </div>
  )
};

export default Users;
