import { z } from 'zod';

enum BlueprintVersion {
  Version_1 = 1
}

enum BlueprintNodeType {
  Blah
}

const BlueprintNode = z.object({
  id: z.number(),
  type: z.nativeEnum(BlueprintNodeType)
});

const BlueprintContentSchema = z.object({});

export const BlueprintSchema = z.object({
  version: z.nativeEnum(BlueprintVersion),
  content: z.array(BlueprintContentSchema)
});

export type Blueprint = z.infer<typeof BlueprintSchema>;
