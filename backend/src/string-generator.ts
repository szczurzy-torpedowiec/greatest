import eol from 'eol';
import fse from 'fs-extra';
import path from 'path';
import { randomInt } from './utils';

let dictionary: string[] | null = null;

export async function loadDictionary() {
  const content = await fse.readFile(path.join(__dirname, '../assets/dictionary-pl.txt'), {
    encoding: 'utf-8',
  });
  dictionary = eol.split(content)
    .map((word) => word.trim())
    .filter((word) => word !== '');
}

export function getRandomString() {
  if (dictionary === null) throw new Error('Dictionary not loaded');
  return dictionary[randomInt(dictionary.length)];
}
