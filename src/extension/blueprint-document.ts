import * as vscode from 'vscode';

interface BlueprintEdit {
	readonly color: string;
	readonly stroke: ReadonlyArray<[number, number]>;
}

interface BlueprintDocumentDelegate {
  getFileData(): Promise<Uint8Array>;
}

export class BlueprintDocument extends vscode.Disposable implements vscode.CustomDocument {
  static async create(uri: vscode.Uri, backupId: string | undefined, delegate: BlueprintDocumentDelegate) {
    const dataFile = typeof backupId === "string" ? vscode.Uri.parse(backupId) : uri;
    const fileData = await BlueprintDocument.readFile(dataFile);
    return new BlueprintDocument(uri, fileData, delegate);
  }

  private static async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    if (uri.scheme === 'untitled') {
      return new Uint8Array();
    } else {
      return new Uint8Array(await vscode.workspace.fs.readFile(uri));
    }
  }

  private readonly _uri: vscode.Uri;

  private _documentData: Uint8Array;
	private _edits: Array<BlueprintEdit> = [];
	private _savedEdits: Array<BlueprintEdit> = [];

  private readonly _delegate: BlueprintDocumentDelegate;

	private constructor(
		uri: vscode.Uri,
		initialContent: Uint8Array,
		delegate: BlueprintDocumentDelegate
	) {
		super(() => this.dispose());
		this._uri = uri;
		this._documentData = initialContent;
		this._delegate = delegate;
	}

  public get uri() { return this._uri; }

	public get documentData(): Uint8Array { return this._documentData; }

  dispose(): void {
    throw new Error('Method not implemented.');
  }
}
