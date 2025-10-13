export interface UserDto {
  /** The ID of the user. */
  id: number;

  acc: string;

  isStallOwner: boolean;

  stallIds: string[];
}

export interface CreateUserDto {
  acc: string;

  isStallOwner: boolean;

  stallIds: string[];
}
