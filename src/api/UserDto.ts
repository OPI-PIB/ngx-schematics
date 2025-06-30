import { AdressDto } from './AdressDto';

export interface UserDto {
	firstname: string;
	midname: string | null;
	lastname?: string;
	age: number | null;
	active: boolean;
	activeNullable: boolean | null;
	activeOptional?: boolean;
	address: AdressDto;
	addressNullable: AdressDto | null;
	addressOptional?: AdressDto;
	keywords: string[];
	friends: UserDto[];
	// eslint-disable-next-line @typescript-eslint/array-type
	friendsOptional?: Array<UserDto>;
	friendsNullable: UserDto[] | null;
}
