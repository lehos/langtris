# -*- condig: utf-8 -*-

import sys, os, codecs

if len(sys.argv) > 1:
	work_dir = './' + sys.argv[1]
else:
	work_dir = '.'


for dirname, dirnames, filenames in os.walk(work_dir):

	# print path to all filenames.
	for filename in filenames:
		filepath = os.path.join(dirname, filename)

		if filepath.find('.css') != -1:
			# print filepath

			new_filepath = filepath.replace('.css', '.scss')
			os.rename(filepath, new_filepath)

			file = codecs.open(new_filepath, 'r', 'utf-8')
			data = file.read()
			file.close()

			if data.find('@charset') == -1:
				file = codecs.open(new_filepath, 'w', 'utf-8')
				file.write('@charset "utf-8";\n\n' + data)
				file.close()
