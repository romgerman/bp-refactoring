import * as ts from "typescript";

enum ChangeKind {
  RemoveNode,
  ReplaceWithNode,
  ReplaceTextWithNode,
  ReplaceText,
}

type Change = RemoveNodeChange | ReplaceWithNodeChange | ReplaceTextChange;

interface BaseChange {
  readonly sourceFile: ts.SourceFile;
  readonly range: ts.TextSpan;
}

interface RemoveNodeChange extends BaseChange {
  readonly kind: ChangeKind.RemoveNode;
  node?: never;
}

interface ReplaceWithNodeChange extends BaseChange {
  readonly kind: ChangeKind.ReplaceWithNode;
  node: ts.Node;
}

interface ReplaceTextChange extends BaseChange {
  readonly kind: ChangeKind.ReplaceText;
  newText: string;
}

export class ChangeTracker {
  private readonly changes: Change[] = [];

  replaceNode({ sourceFile, span, node }: { sourceFile: ts.SourceFile; span: ts.TextSpan; node: ts.Node }): void {
    const containsSpan = this.changes.some((c) => ts.textSpanContainsTextSpan(c.range, span));

    if (containsSpan) {
      return;
    }

    this.changes.push({
      kind: ChangeKind.ReplaceWithNode,
      sourceFile: sourceFile,
      node: node,
      range: span,
    });
  }

  removeNode({ sourceFile, node }: { sourceFile: ts.SourceFile; node: ts.Node }): void {
    this.changes.push({
      kind: ChangeKind.RemoveNode,
      sourceFile: sourceFile,
      range: ts.createTextSpanFromBounds(node.getStart(), node.getEnd()),
    });
  }

  replaceText({ sourceFile, span, newText }: { sourceFile: ts.SourceFile; span: ts.TextSpan; newText: string }): void {
    this.changes.push({
      kind: ChangeKind.ReplaceText,
      sourceFile: sourceFile,
      newText,
      range: span,
    });
  }

  appyChanges(): void {
    const map = new Map<ts.SourceFile, Change[]>();

    for (const change of this.changes) {
      if (map.has(change.sourceFile)) {
        map.get(change.sourceFile)?.push(change);
      } else {
        map.set(change.sourceFile, [change]);
      }
    }

    for (const arr of map.values()) {
      arr.sort((a, b) => a.range.start - b.range.start);
    }

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.CarriageReturnLineFeed,
      removeComments: false,
      omitTrailingSemicolon: true,
    });

    function replaceText(text: string, pos: number, oldLength: number, newText: string): string {
      return text.substring(0, pos) + newText + text.substring(pos + oldLength);
    }

    for (const sourceFile of map.keys()) {
      const changes = map.get(sourceFile)!;
      let text = sourceFile.getText();
      let diff = 0;
      for (const change of changes) {
        if (change.kind === ChangeKind.ReplaceWithNode) {
          const newText = printer.printNode(ts.EmitHint.Unspecified, change.node, sourceFile);
          text = replaceText(text, change.range.start + diff, change.range.length, newText);
          diff += newText.length - change.range.length;
        } else if (change.kind === ChangeKind.ReplaceText) {
          text = replaceText(text, change.range.start + diff, change.range.length, change.newText);
          diff += change.newText.length - change.range.length;
        } else if (change.kind === ChangeKind.RemoveNode) {
          throw new Error("Not implemented");
        }
      }

      ts.sys.writeFile(sourceFile.fileName, text);
    }
  }
}
