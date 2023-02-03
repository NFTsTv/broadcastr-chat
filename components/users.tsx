import UserAvatar from "./useravatar";
import styles from '@/styles/users.module.css';
import { User } from '@/lib/types';

const Users = ({ users }: { users: User[]}) => {
    return (
      <div style={{marginLeft: "auto", color: "white"}}>
        currently online: {users.length}
      </div>
    )
  };
  
export default Users;
  