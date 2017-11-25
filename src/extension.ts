'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Hover, CompletionItem } from 'vscode';

interface PlsqlPackage {
    packageName: string;
    methodNames: string[];
}

class PlsqlCompletionItemProvider implements vscode.CompletionItemProvider {
    private sourceCompletions : CompletionItem[] = new Array<CompletionItem>();
    private data: Array<PlsqlPackage> = [
        { packageName: 'dbms_output', methodNames: ['put_line', 'get_line'] },
        { packageName: 'dbms_crypto', methodNames: ['decrypt', 'encrypt'] }
    ];

    constructor() {
        // We should load the library here.
        this.sourceCompletions.push(new CompletionItem('test'));
        this.sourceCompletions.push(new CompletionItem('dbms_output'));
        let completionItem = new CompletionItem('dbms_output.put_line', vscode.CompletionItemKind.Function);
        completionItem.insertText = completionItem.label + '();';
        this.sourceCompletions.push(completionItem);
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        let filename = document.fileName;
        let lineText = document.lineAt(position.line).text;
        let lineTillCurrentPosition = lineText.substr(0, position.character);
        let currentWord = this.getCurrentWord(document, position);

        console.log('trigger kind: ', (context.triggerKind == vscode.CompletionTriggerKind.Invoke ? 'invoked' : 'character'));
        console.log('lineTillCurrentPosition', lineTillCurrentPosition);
        console.log('currentWord', currentWord);
        let searchTerms = currentWord.split('.');
        // console.log('searchTerms', searchTerms);

        switch(searchTerms.length) {
            case 1:
                return this.findPackageNames(searchTerms[0]);
            case 2:
                return this.findMethodNames(searchTerms[0);
            default:
                return null;
        }
    }
    resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {

        // console.log(item);
        // item.detail = 'more about this...';
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

    private findPackageNames(searchString: string): CompletionItem[] {
        let results: CompletionItem[] = new Array<CompletionItem>();

        this.data.filter(function(plsqlPackage: PlsqlPackage) {
            return plsqlPackage.packageName.toLowerCase().indexOf(this.toLowerCase()) >= 0;
        }, searchString).forEach(
            function (value: PlsqlPackage, index: number, array: PlsqlPackage[]) {
                results.push(new CompletionItem(value.packageName, vscode.CompletionItemKind.Module));
            }
        );

        return results;
    }

    private findMethodNames(packageName: string): CompletionItem[] {
        let results: CompletionItem[] = new Array<CompletionItem>();

        this.data.filter(function (plsqlPackage: PlsqlPackage) {
            return plsqlPackage.packageName.toLowerCase().indexOf(this.toLowerCase()) >= 0;
        }, packageName).forEach(
            function (value: PlsqlPackage, index: number, array: PlsqlPackage[]) {
                value.methodNames.forEach(function (value: string, index: number, array: string[]) {
                    results.push(new CompletionItem(value, vscode.CompletionItemKind.Method));
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
    console.log('Extension "plsql-toolkit" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
    // context.subscriptions.push(
        // vscode.languages.registerHoverProvider(
        //     'plsql',
        //     {
        //         provideHover(document, position, token) {
        //             console.log('hovering...');
        //             return new Hover('Hovering');
        //         }
        //     }
        // );
    // );
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
    console.log('Extension "plsql-toolkit" is now inactive!');
}