export default {
    '*.{ts,js}': ['oxlint --fix', 'oxfmt --write'],
    '*.{json,css,md,yaml,yml}': ['oxfmt --write'],
};
