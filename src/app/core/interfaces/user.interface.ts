import { UserDto } from '../models/user.model';

export interface User extends Omit<UserDto, 'markedList'> {}
