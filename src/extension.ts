// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "helloworld" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
		

	
	function main(codigoCS : any) {
		const regexPropsCs = /public .+ .+;/gm;
		const propsCs = codigoCS.match(regexPropsCs);
		var classeJs = `constructor () {
		$
	}`;
		if (propsCs === null) {
		  return;
		}
		const valoresIniciais = {
		  string: `''`,
		  guid: `''`,
		  int: 0,
		  double: 0,
		  decimal: 0,
		  float: 0,
		  datetime: "null",
		  object: "{}",
		  list: `[]`,
		  ienumerable: `[]`,
		  bool: "false",
		};
		propsCs.forEach((propriedade : any) => {
		  let propriedadeSepadara = propriedade.split(" ");
	
		  let nomeTipo = propriedadeSepadara[1]
			.replace("?", "")
			.replace(/<.+>/gm, "")
			.toLocaleLowerCase();
		  let nomeVariavel = propriedadeSepadara[2].replaceAll(";", "");
		  classeJs = classeJs.replaceAll(
			`$`,
			`this.${nomeVariavel} = undefined;
		$`
		  );
		});
	
		classeJs = classeJs.replaceAll("$", "");
		return classeJs;
		//document.querySelector(".lado-js textarea").value = classeJs;
	  
	}
	function getClassName(codigoCS : any){	

		const regexPropsCs = /public class (?<nome_classe>.+)/gm;
		//const propsCs = codigoCS.match(regexPropsCs);
		let nomeClasse = regexPropsCs.exec(codigoCS);
		return nomeClasse ? nomeClasse[1] : ""; 
		
	} 
	function  createFormTemplate(components : any , display : string , rowNumber? : number , columnNumber? : number){
		
		let output = "";
		
		components.forEach((component : any)=>{
			output +=  `\t${getTemplateCode(component)}`;
		  });
		
		let formFlex = `
			width: 100%;
			height: 100%;
			display: flex;
			gap:15px;`;

		let formGrid = `width: 100%;
			height: 100%;
			display: grid;
			grid-template-rows: repeat(${rowNumber},1fr);
			grid-template-columns: repeat(${columnNumber},1fr);
			gap:15px;`;
    	
		output = `<div style ="${display ===  'flex' ? formFlex : formGrid}" >\n${output}</div>`;
		
		return output;
	}
	function getTemplateCode(component : any){
		let props : String = "";
		let style : String = "";
		props = getCurrenctComponentAtrributeInString(component.props);
		style = getCurrenctComponentStyleInString(component.style);
		return `<${component.name} ${props} ${style} \n\t\tvmodel=${component.vmodel}\n\t/>\n`;
  
	}
	function  getCurrenctComponentAtrributeInString(attributes : any) : string {
	let str : string = "";
	Object.keys(attributes).forEach((att : any) => {
		if(typeof attributes[att] === "string" && (!attributes[att].includes('this.'))){
			str =str + `\n\t\t${att}="${attributes[att]}"`;       
		}else{
			str =str + `\n\t\t:${att} = "${attributes[att]}"`;
		}
	});
	return str;
	}
	function getCurrenctComponentStyleInString(attributes : any) : string {
	let str : string = "";
	Object.keys(attributes).forEach((att : any) => {
		str =str + `\n\t\t${att}:'${attributes[att]}';`;       
	});
	return `\n\t\tstyle = "${str}"`;
	}
	function formatSelectedTextToJSON(text : string){
		text = text.replace('{{','[');
		text = text.replace('}}',']');
		const regexSubJson = /[-\w+']+:/gm;
		const strWithoutMarks = text.match(regexSubJson);
		strWithoutMarks?.forEach((str : string)=>{
			text=text.replace(str,`"${str.slice(0,str.length - 1)}":`);
		});
		
		const regexComponentName = /\w+\(\){/gm;
		const componentNames = text.match(regexComponentName);
		
		componentNames?.forEach((str : string)=>{
			text=text.replace(str,`{\n\t"name":"${str.slice(0,str.length - 3)}",`);
		});

		const regexSpace = /: +/gm;
		
		const  regexWithSpace = text.match(regexSpace);
		console.log(regexWithSpace)
		regexWithSpace?.forEach((str : string)=>{
			text=text.replace(str,':');
		})
		text=text.replaceAll("\"\'",'\'');
		text=text.replaceAll("\'\"",'\'');
		text=text.replaceAll("\'",'\"');
		console.log(text)
		return JSON.parse(text);
	}
	context.subscriptions.push(
		vscode.commands.registerCommand('helloworld.converterViewModel', () => {
			
			const editor = vscode.window.activeTextEditor;
			if(editor){
				
				let selectedText = editor.document.getText(editor.selection);
				let selection = editor.selection;
				let formatedText = main(selectedText);
				let className = getClassName(selectedText);
				formatedText =  `export default class ${className} { \n\t${formatedText}\n}`;		
				let firstLine = editor.document.lineAt(selection.anchor).lineNumber;
				let lastLine = editor.document.lineAt(selection.active).lineNumber;
				let invalidRange = new vscode.Range(firstLine,firstLine, lastLine,lastLine);
				
				let validFullRange = editor.document.validateRange(invalidRange);
				
				editor?.edit(editor => {
					
					editor.replace(validFullRange,formatedText ?? "");
				});
						 
			}
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			// vscode.window.showInformationMessage('Hello World from HelloWorld!');
		})
	);
		
	context.subscriptions.push(
		vscode.commands.registerCommand('helloworld.formGenerator', async () => {
			
			const editor = vscode.window.activeTextEditor;
			
			if(editor){
				
				let selectedText = editor.document.getText(editor.selection);
				let selection = editor.selection;
				let displayType : string;
				const displayTypeReturn = await vscode.window.showInputBox({
					placeHolder:"(flex/grid) - Vazio = flex",
					prompt:"Insira o tipo de display do container (flex/grid)"
				}).then((e)=>{return e?.toLowerCase();});
				
				if(displayTypeReturn){
					displayType = !displayTypeReturn.toString()  ? "flex" : displayTypeReturn.toString();

					let rowNumber :number = 0 ;
					let columnNumber : number  = 0;
					
					if(displayType === "grid"){
						rowNumber = await vscode.window.showInputBox({
							placeHolder:"linhas",
							prompt:"Insira o numero de linhas do grid"
						}).then((e)=>{return parseInt(e ? e : "");});
						columnNumber = await vscode.window.showInputBox({
							placeHolder:"colunas",
							prompt:"Insira o numero de colunas do grid"
						}).then(e=>{return parseInt(e ? e : "");});
					}
					try{
						let jsonText = formatSelectedTextToJSON(selectedText)
						let formatedText = createFormTemplate(jsonText ?? "",displayType, rowNumber , columnNumber);	
						let firstLine = editor.document.lineAt(selection.anchor).lineNumber;
						let lastLine = editor.document.lineAt(selection.active).lineNumber;
						let invalidRange = new vscode.Range(firstLine,firstLine, lastLine,lastLine);
						
						let validFullRange = editor.document.validateRange(invalidRange);
						
						editor?.edit(editor => {
							
							editor.replace(validFullRange,formatedText ?? "");
						});
					}catch(e){						
						vscode.window.showErrorMessage("Erro na geração do formulário, você esqueceu uma vírgula no final do texto?\n"+e);
					}

				}


						 
			}
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			// vscode.window.showInformationMessage('Hello World from HelloWorld!');
		})
	);

	

}

// This method is called when your extension is deactivated
export function deactivate() {}
