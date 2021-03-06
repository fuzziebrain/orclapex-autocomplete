'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Hover, CompletionItem } from 'vscode';
import * as path from 'path';

interface ApiDetails {
  packageName: string,
  procFuncName: string,
  bodyNoDefault: string,
  bodyFullText: string,
  url: string,
  descriptionText: string
}

class PlsqlCompletionItemProvider implements vscode.CompletionItemProvider {
    private dictionary: Map<string, Map<string, ApiDetails>>;

    constructor() {
        // We should load the library here.
        this.dictionary = require(path.resolve(__dirname, '../data/allFuncProcsOracle12CApex51.json'));
        console.log('API dictionary successfully loaded.');
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        let filename = document.fileName;
        let lineText = document.lineAt(position.line).text;
        let lineTillCurrentPosition = lineText.substr(0, position.character);
        let currentWord = this.getCurrentWord(document, position);

        let searchTerms = currentWord.split('.');

        switch(searchTerms.length) {
            case 1:
                return this.findPackageByName(searchTerms[0]);
            case 2:
                return this.findMethodByName(searchTerms[0]);
            default:
                return null;
        }
    }
    resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
		// Return the item as-is for now.
        return item;
    }

    private getCurrentWord(document: vscode.TextDocument, position: vscode.Position) {
        let i = position.character - 1;
        const text = document.lineAt(position.line).text;
        while (i >= 0 && ' \t\n\r\v":{[,'.indexOf(text.charAt(i)) === -1) {
            i--;
        }
        return text.substring(i + 1, position.character);
    }

    private findPackageByName(searchString: string): CompletionItem[] {
        let results: CompletionItem[] = new Array<CompletionItem>();

        Object.keys(this.dictionary).filter(function(packageName: string) {
            return packageName.toLowerCase().indexOf(this.toLowerCase()) >= 0;
        }, searchString).forEach(
            function (packageName: string, index: number, array: string[]) {
                results.push(new CompletionItem(packageName.toLowerCase(), vscode.CompletionItemKind.Module));
            }
        );

        return results;
    }

    private findMethodByName(packageName: string): CompletionItem[] {
		let results: CompletionItem[] = new Array<CompletionItem>();
		let dictionary = this.dictionary;

        Object.keys(dictionary).filter(function(packageName: string) {
            return packageName.toLowerCase().indexOf(this.toLowerCase()) >= 0;
        }, packageName).forEach(
            function (packageName: string, index: number, array: string[]) {
                Object.keys(dictionary[packageName]).forEach(function (methodName: string, index: number, array: string[]) {
					let apiDetails: ApiDetails = dictionary[packageName][methodName];
					let completionItem = new CompletionItem(methodName.toLowerCase(), vscode.CompletionItemKind.Method);
					completionItem.detail = apiDetails.descriptionText;
					completionItem.insertText = new vscode.SnippetString(completionItem.label + '(\n' + apiDetails.bodyNoDefault + '\n);');
					results.push(completionItem);
                });
            }
		);

        return results;
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Extension "orclapex-autocomplete" is now active!');
	console.log(vscode.extensions);

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'plsql',
            new PlsqlCompletionItemProvider(),
            '.'
        )
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('Extension "orclapex-autocomplete" is now inactive!');
}
