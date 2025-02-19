# Save as cleanup-gui.ps1
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create form
$form = New-Object System.Windows.Forms.Form
$form.Text = 'Docker Image Manager'
$form.Size = New-Object System.Drawing.Size(400,550)  # Height increased for button
$form.StartPosition = 'CenterScreen'

# Create ListView
$listView = New-Object System.Windows.Forms.ListView
$listView.View = [System.Windows.Forms.View]::Details
$listView.Size = New-Object System.Drawing.Size(380,400)
$listView.Location = New-Object System.Drawing.Point(10,10)
$listView.FullRowSelect = $true

# Create Delete All Button
$deleteAllButton = New-Object System.Windows.Forms.Button
$deleteAllButton.Text = "Delete All Images"
$deleteAllButton.Size = New-Object System.Drawing.Size(150,30)
$deleteAllButton.Location = New-Object System.Drawing.Point(10,420)
$deleteAllButton.BackColor = [System.Drawing.Color]::FromArgb(255, 200, 200)

# Create Loading Panel
$loadingPanel = New-Object System.Windows.Forms.Panel
$loadingPanel.Size = New-Object System.Drawing.Size(400,550)
$loadingPanel.Location = New-Object System.Drawing.Point(0,0)
$loadingPanel.BackColor = [System.Drawing.Color]::FromArgb(128, 255, 255, 255)
$loadingPanel.Visible = $false

$loadingLabel = New-Object System.Windows.Forms.Label
$loadingLabel.Text = "Deleting Image..."
$loadingLabel.AutoSize = $true
$loadingLabel.Location = New-Object System.Drawing.Point(150,230)
$loadingLabel.Font = New-Object System.Drawing.Font("Arial", 12, [System.Drawing.FontStyle]::Bold)
$loadingPanel.Controls.Add($loadingLabel)

# Add columns
$listView.Columns.Add("Docker Images", 380)

# Function to refresh image list
function RefreshImages {
    $listView.Items.Clear()
    $dockerImages = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -like "weather_cctv*" }
    foreach ($image in $dockerImages) {
        $listItem = New-Object System.Windows.Forms.ListViewItem($image)
        $listView.Items.Add($listItem)
    }
}

# Initial load of images
RefreshImages

# Delete All Button Click Handler
$deleteAllButton.Add_Click({
    $imageCount = $listView.Items.Count
    if ($imageCount -eq 0) {
        [System.Windows.Forms.MessageBox]::Show(
            "No images to delete.",
            "Information"
        )
        return
    }

    $result = [System.Windows.Forms.MessageBox]::Show(
        "Are you sure you want to delete all $imageCount images?",
        "Confirm Delete All",
        [System.Windows.Forms.MessageBoxButtons]::YesNo
    )
    
    if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
        # Show loading panel
        $loadingPanel.Visible = $true
        $form.Refresh()
        
        $output = ""
        foreach ($item in $listView.Items) {
            $imageName = $item.Text
            $output += docker rmi $imageName 2>&1
            $output += "`n"
        }
        
        # Hide loading panel
        $loadingPanel.Visible = $false
        
        [System.Windows.Forms.MessageBox]::Show(
            "Result:`n$output",
            "Operation Complete"
        )
        RefreshImages
    }
})

# Double-click event handler
$listView.Add_DoubleClick({
    $selectedItem = $listView.SelectedItems[0].Text
    $result = [System.Windows.Forms.MessageBox]::Show(
        "Do you want to delete the image: $selectedItem ?",
        "Confirm Delete",
        [System.Windows.Forms.MessageBoxButtons]::YesNo
    )
    if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
        # Show loading panel
        $loadingPanel.Visible = $true
        $form.Refresh()

        # Delete image
        $output = docker rmi $selectedItem 2>&1

        # Hide loading panel
        $loadingPanel.Visible = $false
        
        [System.Windows.Forms.MessageBox]::Show(
            "Result: $output",
            "Operation Complete"
        )
        RefreshImages
    }
})

# Add controls to form
$form.Controls.Add($listView)
$form.Controls.Add($deleteAllButton)
$form.Controls.Add($loadingPanel)

# Show form
$form.ShowDialog()