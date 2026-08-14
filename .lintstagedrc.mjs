export default {
    '*.{json,css,md,yaml,yml}': ['oxfmt --write'],
    '*.{ts,js}': ['oxlint --fix', 'oxfmt --write'],
};
