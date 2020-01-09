import chalk from 'chalk';

export const log = (text: TemplateStringsArray, ...placeholders: string[]) => {
  console.log(chalk(text, ...placeholders));
};
