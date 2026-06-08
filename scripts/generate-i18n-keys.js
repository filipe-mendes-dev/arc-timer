#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT_DIR = path.join(__dirname, '..');
const SOURCE_PATH = path.join(
    ROOT_DIR,
    'src',
    'i18n',
    'resources',
    'interfaces.ts',
);
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'i18n', 'i18nKeys.ts');
const INTERFACE_NAME = 'I18nResource';

const sourceText = fs.readFileSync(SOURCE_PATH, 'utf8');
const sourceFile = ts.createSourceFile(
    SOURCE_PATH,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
);

const findResourceInterface = () => {
    for (const statement of sourceFile.statements) {
        if (
            ts.isInterfaceDeclaration(statement) &&
            statement.name.text === INTERFACE_NAME
        ) {
            return statement;
        }
    }

    throw new Error(`Could not find ${INTERFACE_NAME} in ${SOURCE_PATH}`);
};

const getPropertyName = (name) => {
    if (
        ts.isIdentifier(name) ||
        ts.isStringLiteral(name) ||
        ts.isNumericLiteral(name)
    ) {
        return name.text;
    }

    throw new Error(`Unsupported property name: ${name.getText(sourceFile)}`);
};

const isStringLeaf = (node) =>
    node.kind === ts.SyntaxKind.StringKeyword ||
    ts.isLiteralTypeNode(node) ||
    ts.isTemplateLiteralTypeNode(node);

const isIdentifierKey = (key) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);

const formatObjectKey = (key) =>
    isIdentifierKey(key) ? key : JSON.stringify(key);

const formatStringValue = (value) =>
    `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const readMembers = (members, pathParts = []) => {
    const result = {};

    for (const member of members) {
        if (!ts.isPropertySignature(member)) {
            throw new Error(
                `Unsupported member at ${member.getStart(sourceFile)}`,
            );
        }

        if (!member.type) {
            throw new Error(
                `Missing type for ${member.name.getText(sourceFile)}`,
            );
        }

        const key = getPropertyName(member.name);
        const nextPathParts = [...pathParts, key];

        if (isStringLeaf(member.type)) {
            result[key] = nextPathParts.join('.');
            continue;
        }

        if (ts.isTypeLiteralNode(member.type)) {
            result[key] = readMembers(member.type.members, nextPathParts);
            continue;
        }

        throw new Error(
            `Unsupported type for ${nextPathParts.join('.')}: ${member.type.getText(sourceFile)}`,
        );
    }

    return result;
};

const renderValue = (value, indentLevel = 0) => {
    if (typeof value === 'string') {
        return formatStringValue(value);
    }

    const indent = '    '.repeat(indentLevel);
    const childIndent = '    '.repeat(indentLevel + 1);
    const entries = Object.entries(value).map(([key, childValue]) => {
        const renderedChild = renderValue(childValue, indentLevel + 1);

        return `${childIndent}${formatObjectKey(key)}: ${renderedChild},`;
    });

    return ['{', ...entries, `${indent}}`].join('\n');
};

const resourceInterface = findResourceInterface();
const keyTree = readMembers(resourceInterface.members);
const renderedTree = renderValue(keyTree);
const output = `import type { I18nResource } from './resources/interfaces';

type I18nKeyTree<T, Prefix extends string = ''> = {
    readonly [K in keyof T]: T[K] extends string
        ? \`\${Prefix}\${Extract<K, string>}\`
        : I18nKeyTree<T[K], \`\${Prefix}\${Extract<K, string>}.\`>;
};

export const i18nKeys = ${renderedTree} as const satisfies I18nKeyTree<I18nResource>;
`;

fs.writeFileSync(OUTPUT_PATH, output);
console.log(`Generated ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
