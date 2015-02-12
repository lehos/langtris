"""Library for Yandex Translate API."""

import urllib
import json
import codecs


def get_langs():
    """Returns the list of supported languages."""
    url = 'http://translate.yandex.net/api/v1/tr.json/getLangs'
    f = urllib.urlopen(url)
    js = f.read()
    return json.loads(js)['dirs']


def detect(text, format='plain'):
    """Detects the language of a text string."""
    formats = ['plain', 'html']
    if format not in formats:
        raise TypeError, 'The format should be plain or html'
    params = urllib.urlencode({'text': text, 'format': format})
    url = 'http://translate.yandex.net/api/v1/tr.json/detect'
    f = urllib.urlopen(url, params)
    js = f.read()
    if json.loads(js)['code'] != 200:
        return False
    return json.loads(js)['lang']


def translate(text, lang, format='plain'):
    """Translate text."""
    formats = ['plain', 'html']
    if format not in formats:
        raise TypeError, 'The format should be plain or html'
    url = 'http://translate.yandex.net/api/v1/tr.json/translate'
    params = urllib.urlencode({'lang': lang, 'text': text, 'format': format})
    f = urllib.urlopen(url, params)
    js = f.read()
    code = json.loads(js)['code']
    if code == 413:
        raise UserWarning, 'ERR_TEXT_TOO_LONG'
    elif code == 422:
        raise UserWarning, 'ERR_UNPROCESSABLE_TEXT'
    elif code == 501:
        raise UserWarning, 'ERR_LANG_NOT_SUPPORTED'
    return json.loads(js)['text'][0]


def main():
    min_length = 3
    f_en_source = open('dicts/en-source.txt', 'r')
    f_en_ru = codecs.open('dicts/en-ru.txt', 'w', 'utf-8')
    en_except_parts = ['conj', 'pron', 'adv', 'prep', 'infinitive-marker', 'modal', 'det']

    lines_en_ru = []
    # counter = 0
    for line in f_en_source:
        words = line.split(' ')
        word_en = words[2]
        word_type = words[3][:-1]
        if len(word_en) >= min_length and (word_type not in en_except_parts):
            word_ru = translate(word_en, 'en-ru')
            if len(word_ru) >= min_length:
                # counter += 1
                lines_en_ru.append(word_en + ' | ' + word_ru)

    f_en_ru.write('\n'.join(lines_en_ru))
    f_en_ru.close()
    f_en_source.close()


main()
