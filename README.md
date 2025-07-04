# @opi_pib/ngx-schematics

Schematics for angular projects

## Install

```
npm i -g @opi_pib/ngx-schematics
```

You can add schematics to angular.json

```
	"cli": {
		"schematicCollections": [
			"@opi_pib/ngx-schematics"
		]
	}
```

## Domain

### entity

Generate files for entity

```typescript
ng g @opi_pib/ngx-schematics:entity --name=uuid
```

or

```typescript
ng g entity --name=uuid
```

### value-object

Generate files for value object

```typescript
ng g @opi_pib/ngx-schematics:vo --name=user
```

or

```typescript
ng g vo --name=user
```

### value-object from Dto

Generate files for value object from dto

```typescript
ng g @opi_pib/ngx-schematics:vo-dto --dto=UserDto
```

or

```typescript
ng g vo-dto UserDto
```

### value-object from Enum

Generate files for value object from enum

```typescript
ng g @opi_pib/ngx-schematics:vo-enum --dto=EnumDto
```

or

```typescript
ng g vo-enum EnumDto
```
