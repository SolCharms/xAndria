# From root directory of program
cd ./target/types

for FILENAME in *.ts

do 
	NAME="${FILENAME%.*}"
	
	cp -r ${FILENAME} ../../src/${NAME}.types.ts
done

echo IDLs and Types copied!
