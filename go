#!/bin/bash

next=0
re="^[0-9]+$"

while true
do
	read step
	[[ "$step" =~ $re ]] && temp=$step

	if [ "$step" == "b"  ]
	then
		next=$((next-1))
	elif [ ! -z "$temp" ]
	then
		next=$temp
	else
		next=$((next+1))
	fi

	branch_name=$(git branch | egrep $next)

	if [ ! -z "$branch_name" ]
	then
		git checkout $branch_name
	fi

	temp=""
done
