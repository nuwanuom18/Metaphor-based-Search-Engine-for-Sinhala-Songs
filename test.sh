status="NOT COMPLETED"
while [ ! -z "$status" ]
do
    status=$(gh pr status --jq '.currentBranch .statusCheckRollup[] | select(.status!="COMPLETED")' --json statusCheckRollup)
    sleep 2
done
echo "finished now"
