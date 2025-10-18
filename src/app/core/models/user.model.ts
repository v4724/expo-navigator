import { MarkedListDto } from './marked-stall.model';

export interface UserDto {
  /** The ID of the user. */
  id: number;

  acc: string;

  isStallOwner: boolean;

  stallIds: string[];

  markedList: MarkedListDto[];
}

export interface CreateUserDto {
  acc: string;

  isStallOwner: boolean;

  stallIds: string[];
}
export interface UpdateUserDto {
  /** The ID of the user. */
  id: number;

  acc: string;

  isStallOwner: boolean;

  stallIds: string[];
}
